// Supabase Integration Helper
const SUPABASE_URL = "https://wpnhelhqemjrcifpnufo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbmhlbGhxZW1qcmNpZnBudWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzI3NjEsImV4cCI6MjA5NTAwODc2MX0.S-ZE_QWQ3OqOEJc6qZVoSoVaYID_jUj4K45d7o5zLJc";

// Global helper object
window.DB_Helper = {
    client: null,
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;

        // Load Supabase Client SDK dynamically if not loaded
        if (!window.supabase) {
            await this.loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
        }
        // Load BCryptJS - uses window.dcodeIO.bcrypt after load
        if (!this.getBcrypt()) {
            await this.loadScript("https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js");
        }

        this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        this.isInitialized = true;
        console.log("Supabase client initialized. bcrypt available:", !!this.getBcrypt());
    },

    // bcryptjs exposes itself as window.dcodeIO.bcrypt (not window.bcrypt)
    getBcrypt() {
        return (window.dcodeIO && window.dcodeIO.bcrypt) || window.bcrypt || null;
    },

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    formatDate(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
               ' • ' + 
               d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    },

    // Authenticate Agent
    async login(email, password) {
        await this.init();
        const { data: users, error } = await this.client
            .from("users")
            .select("*")
            .eq("email", email)
            .or("role.eq.AGENT,role.eq.ADMIN");

        if (error) throw error;
        if (!users || users.length === 0) {
            throw new Error("Không tìm thấy tài khoản nhân viên hỗ trợ.");
        }

        const user = users[0];
        // Verify password using bcryptjs
        const bcrypt = this.getBcrypt();
        if (!bcrypt) {
            throw new Error("Lỗi hệ thống: Không tải được thư viện xác thực mật khẩu.");
        }
        const match = bcrypt.compareSync(password, user.password_hash);
        if (!match) {
            throw new Error("Mật khẩu không chính xác.");
        }

        // Store user session info
        const loggedInUser = {
            id: user.id,
            name: user.full_name,
            role: user.role === 'ADMIN' ? 'Senior Support Agent (Admin)' : 'Support Agent',
            status: 'Active',
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRuP7T--LRZYhwayLQZIsIebtgDR8-HmClMWqE8vOqB8pH0twPtuDr-BisE5Pe9RZ2ZEvfmca34epV4yWyhVJL7rPQb51oU1yxW8P1E1ra7rJG9TOTDOoL9TaCKaAHLSwmr3873hCgAUl0VA2qaZbuMqStMVrBonIDYOytGzIoAB1ymLMO-N8BhZwoK6rDcxTJ7mSSBnzFLeHUBuHspqodD884fTBbvjRdWOxdosO9_YsBlNMLCrJ4uQ03BfzqRCT-ml7fRbibKg"
        };
        localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
        return loggedInUser;
    },

    getCurrentUser() {
        const stored = localStorage.getItem("currentUser");
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch(e) {
                localStorage.removeItem("currentUser");
            }
        }
        return null;
    },

    logout() {
        localStorage.removeItem("currentUser");
    },

    // Sync all data from Supabase to local DB object
    async syncAll(localDB) {
        await this.init();
        
        // Load active user session if available
        const current = this.getCurrentUser();
        if (current) {
            localDB.user = current;
        }

        await Promise.all([
            this.syncTickets(localDB),
            this.syncTemplates(localDB),
            this.syncArticles(localDB)
        ]);
        console.log("All data successfully synced from Supabase.");
    },

    async syncTickets(localDB) {
        const { data: tickets, error } = await this.client
            .from("tickets")
            .select(`
                *,
                customer:users!customer_id(full_name, email),
                game:games(game_name),
                category:ticket_categories(category_name),
                resolutions:ticket_resolutions(*),
                answers:ticket_question_answers(
                    answer_value,
                    question:category_questions(field_key, question_label)
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error syncing tickets:", error);
            return;
        }

        // Transform tickets to match DB format
        const transformedTickets = tickets.map(t => {
            let cleanDescription = t.description || "";
            let questions = (t.answers || []).map(ans => ({
                id: ans.question?.field_key || "generic_field",
                q: ans.question?.question_label || "Field",
                a: ans.answer_value || ""
            }));

            // If structured questions are empty, try to parse from the description text
            if (questions.length === 0 && cleanDescription) {
                const markerIndex = cleanDescription.includes("-- Chi tiết danh mục --")
                    ? cleanDescription.indexOf("-- Chi tiết danh mục --")
                    : cleanDescription.indexOf("-- Category Details --");
                
                if (markerIndex !== -1) {
                    const descPart = cleanDescription.slice(0, markerIndex).trim();
                    const metaPart = cleanDescription.slice(markerIndex).trim();
                    cleanDescription = descPart;

                    const lines = metaPart.split('\n');
                    lines.forEach(line => {
                        if (line.includes(':')) {
                            const colonIdx = line.indexOf(':');
                            const key = line.slice(0, colonIdx).trim();
                            const val = line.slice(colonIdx + 1).trim();
                            
                            if (key && !key.startsWith('--')) {
                                let fieldKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                if (fieldKey.includes('operating_system') || fieldKey.includes('platform')) {
                                    fieldKey = 'operating_system';
                                } else if (fieldKey.includes('issue_type')) {
                                    fieldKey = 'issue_type';
                                } else if (fieldKey.includes('graphics_cpu_brand') || fieldKey.includes('cpu_brand') || fieldKey.includes('graphics') || fieldKey.includes('hardware')) {
                                    fieldKey = 'graphics_cpu_brand';
                                } else if (fieldKey.includes('error_code')) {
                                    fieldKey = 'error_code';
                                }

                                questions.push({
                                    id: fieldKey,
                                    q: key,
                                    a: val
                                });
                            }
                        }
                    });
                }
            }

            const replies = [
                {
                    sender: "customer",
                    text: cleanDescription,
                    time: this.formatDate(t.created_at)
                }
            ];

            if (t.resolutions && t.resolutions.length > 0) {
                t.resolutions.forEach(res => {
                    replies.push({
                        sender: "agent",
                        text: res.resolution_content,
                        time: this.formatDate(res.resolved_at)
                    });
                });
            }

            // Convert DB status / priority to Title Case
            const statusMap = { 'OPEN': 'Open', 'DRAFTING': 'Drafting', 'IN_PROGRESS': 'Drafting', 'RESOLVED': 'Resolved' };
            const priorityMap = { 'LOW': 'Low', 'MEDIUM': 'Medium', 'HIGH': 'High', 'URGENT': 'High' };

            return {
                id: t.ticket_number || `#${t.id.slice(0, 6)}`,
                db_id: t.id,
                customer: t.customer?.full_name || "Unknown Customer",
                customerEmail: t.customer?.email || "",
                customerInitials: t.customer?.full_name ? t.customer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : "CU",
                game: t.game?.game_name || "Unknown Game",
                category: t.category?.category_name || "General Inquiry",
                date: this.formatDate(t.created_at),
                status: statusMap[t.status] || 'Open',
                os: questions.find(q => q.id === 'operating_system')?.a || "Unknown OS",
                description: cleanDescription,
                questions: questions,
                replies: replies,
                aiSuggestion: t.ai_suggestion || "",
                overdue: t.overdue || false,
                handleTime: parseFloat(t.handle_time) || 0
            };
        });

        localDB.tickets.length = 0;
        localDB.tickets.push(...transformedTickets);
    },

    async syncTemplates(localDB) {
        const { data: templates, error } = await this.client
            .from("response_templates")
            .select(`
                *,
                category:ticket_categories(category_name)
            `);

        if (error) {
            console.error("Error syncing templates:", error);
            return;
        }

        const transformedTemplates = templates.map(temp => ({
            id: temp.id,
            name: temp.template_name,
            category: temp.category?.category_name || "General",
            shortcut: "/" + temp.template_name.toLowerCase().replace(/\s+/g, '-'),
            content: temp.template_content,
            status: temp.is_published ? 'PUBLISHED' : 'DRAFT',
            usageCount: 0
        }));

        localDB.templates.length = 0;
        localDB.templates.push(...transformedTemplates);

        // Merge localStorage drafts (Supabase RLS may block fetching is_published=false)
        const localDrafts = this.getLocalDraftTemplates();
        console.log('[DB_Helper] localDraftTemplates from localStorage:', JSON.stringify(localDrafts));
        localDrafts.forEach(draft => {
            const alreadyInDB = localDB.templates.find(t => t.id === draft.id);
            if (!alreadyInDB) {
                localDB.templates.push(draft);
                console.log('[DB_Helper] Merged local draft template into DB:', draft.name);
            } else {
                // If Supabase returned it (meaning RLS allows it), remove from localStorage
                this.removeLocalDraftTemplate(draft.id);
            }
        });
        console.log('[DB_Helper] syncTemplates complete. Total templates in memory:', localDB.templates.length, '| DRAFTs:', localDB.templates.filter(t => t.status === "DRAFT").length);
    },

    async syncArticles(localDB) {
        const { data: articles, error } = await this.client
            .from("knowledge_base_articles")
            .select("*");

        if (error) {
            console.error("Error syncing articles:", error);
            return;
        }

        const transformedArticles = articles.map(art => ({
            id: art.id,
            title: art.title,
            category: art.category,
            tags: art.tags ? art.tags.split(',').map(t => t.trim()) : [],
            content: art.content,
            author: "System Admin",
            time: this.formatDate(art.updated_at || art.created_at),
            views: art.view_count || 0,
            status: art.is_published ? "PUBLISHED" : "DRAFT"
        }));

        localDB.articles.length = 0;
        localDB.articles.push(...transformedArticles);

        // Merge localStorage drafts (Supabase RLS may block fetching is_published=false)
        const localDrafts = this.getLocalDraftArticles();
        console.log('[DB_Helper] localDraftArticles from localStorage:', JSON.stringify(localDrafts));
        localDrafts.forEach(draft => {
            const alreadyInDB = localDB.articles.find(a => a.id === draft.id);
            if (!alreadyInDB) {
                localDB.articles.push(draft);
                console.log('[DB_Helper] Merged local draft article into DB:', draft.title);
            } else {
                // If Supabase returned it, remove from localStorage
                this.removeLocalDraftArticle(draft.id);
            }
        });
        console.log('[DB_Helper] syncArticles complete. Total articles in memory:', localDB.articles.length, '| DRAFTs:', localDB.articles.filter(a => a.status === "DRAFT").length);
    },

    // --- Local Draft Helpers (localStorage fallback for RLS-restricted drafts) ---
    getLocalDraftTemplates() {
        try { return JSON.parse(localStorage.getItem('localDraftTemplates') || '[]'); }
        catch(e) { return []; }
    },

    saveLocalDraftTemplate(name, category, content) {
        const drafts = this.getLocalDraftTemplates();
        const draft = {
            id: 'local-' + Date.now(),
            name: name,
            category: category,
            shortcut: '/' + name.toLowerCase().replace(/\s+/g, '-'),
            content: content,
            status: 'DRAFT',
            usageCount: 0,
            isLocal: true
        };
        drafts.push(draft);
        localStorage.setItem('localDraftTemplates', JSON.stringify(drafts));
        console.log('[DB_Helper] Draft template saved to localStorage:', draft.name, '| Total drafts:', drafts.length);
        return draft;
    },

    removeLocalDraftTemplate(id) {
        const drafts = this.getLocalDraftTemplates().filter(d => d.id !== id);
        localStorage.setItem('localDraftTemplates', JSON.stringify(drafts));
    },

    getLocalDraftArticles() {
        try { return JSON.parse(localStorage.getItem('localDraftArticles') || '[]'); }
        catch(e) { return []; }
    },

    saveLocalDraftArticle(title, category, content, tags) {
        const drafts = this.getLocalDraftArticles();
        const draft = {
            id: 'local-' + Date.now(),
            title: title,
            category: category,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            content: content,
            author: 'System Admin',
            time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            views: 0,
            status: 'DRAFT',
            isLocal: true
        };
        drafts.push(draft);
        localStorage.setItem('localDraftArticles', JSON.stringify(drafts));
        console.log('[DB_Helper] Draft article saved to localStorage:', draft.title, '| Total drafts:', drafts.length);
        return draft;
    },

    removeLocalDraftArticle(id) {
        const drafts = this.getLocalDraftArticles().filter(d => d.id !== id);
        localStorage.setItem('localDraftArticles', JSON.stringify(drafts));
    },

    // Update ticket status in Supabase
    async updateTicketStatus(ticketNumberOrId, status) {
        await this.init();
        
        // Find DB ID if ticketNumber is passed
        let dbId = ticketNumberOrId;
        if (ticketNumberOrId.startsWith("TCK-")) {
            const { data, error } = await this.client
                .from("tickets")
                .select("id")
                .eq("ticket_number", ticketNumberOrId)
                .single();
            if (error) throw error;
            dbId = data.id;
        }

        const statusMap = { 'Open': 'OPEN', 'Drafting': 'IN_PROGRESS', 'Resolved': 'RESOLVED' };
        const dbStatus = statusMap[status] || 'OPEN';

        const { error } = await this.client
            .from("tickets")
            .update({ status: dbStatus, updated_at: new Date() })
            .eq("id", dbId);

        if (error) throw error;
    },

    // Save ticket reply / resolution to Supabase
    async saveTicketReply(ticketNumber, replyText) {
        await this.init();
        
        // Find DB ID of ticket
        const { data: ticket, error: ticketErr } = await this.client
            .from("tickets")
            .select("id")
            .eq("ticket_number", ticketNumber)
            .single();

        if (ticketErr) throw ticketErr;
        const ticketId = ticket.id;

        // Update status to RESOLVED
        const { error: updateErr } = await this.client
            .from("tickets")
            .update({ status: 'RESOLVED', updated_at: new Date() })
            .eq("id", ticketId);

        if (updateErr) throw updateErr;

        // Insert resolution
        const currentUser = this.getCurrentUser();
        const { error: resErr } = await this.client
            .from("ticket_resolutions")
            .insert({
                ticket_id: ticketId,
                resolution_content: replyText,
                resolved_by: currentUser.id,
                resolved_at: new Date()
            });

        if (resErr) throw resErr;
    },

    // Save AI suggestion text back to Supabase
    async saveAiSuggestion(ticketNumber, aiText) {
        await this.init();
        const { error } = await this.client
            .from("tickets")
            .update({ ai_suggestion: aiText, updated_at: new Date() })
            .eq("ticket_number", ticketNumber);

        if (error) throw error;
    },

    // Create a new response template
    async createTemplate(name, categoryName, content, isPublished = true) {
        await this.init();
        
        // Find category UUID
        const { data: cat, error: catErr } = await this.client
            .from("ticket_categories")
            .select("id")
            .eq("category_name", categoryName)
            .single();

        if (catErr) throw new Error("Danh mục không tồn tại: " + categoryName);

        const currentUser = this.getCurrentUser();
        const { error } = await this.client
            .from("response_templates")
            .insert({
                template_name: name,
                category_id: cat.id,
                template_content: content,
                created_by: currentUser.id,
                is_published: isPublished
            });

        if (error) throw error;
    },

    // Update an existing response template
    async updateTemplate(id, name, categoryName, content, isPublished = true) {
        await this.init();

        // Find category UUID
        const { data: cat, error: catErr } = await this.client
            .from("ticket_categories")
            .select("id")
            .eq("category_name", categoryName)
            .single();

        if (catErr) throw new Error("Danh mục không tồn tại: " + categoryName);

        const { error } = await this.client
            .from("response_templates")
            .update({
                template_name: name,
                category_id: cat.id,
                template_content: content,
                is_published: isPublished,
                updated_at: new Date()
            })
            .eq("id", id);

        if (error) throw error;
    },

    // Delete a response template (uses SECURITY DEFINER RPC to bypass RLS)
    async deleteTemplate(id) {
        await this.init();

        // Try via RPC function first (bypasses RLS)
        const { error: rpcErr } = await this.client
            .rpc('delete_response_template', { template_id: id });

        if (rpcErr) {
            // RPC function not found — fallback to direct delete
            if (rpcErr.code === 'PGRST202' || rpcErr.message?.includes('Could not find')) {
                const { data, error } = await this.client
                    .from("response_templates")
                    .delete()
                    .eq("id", id)
                    .select();
                if (error) throw error;
                if (!data || data.length === 0) {
                    throw new Error("quyền: Không có quyền xóa template. Chạy SQL trong Supabase Dashboard để tạo function delete_response_template.");
                }
            } else {
                throw rpcErr;
            }
        }
    },

    // Create a new KB article
    async createArticle(title, category, content, tags, isPublished = true) {
        await this.init();
        const currentUser = this.getCurrentUser();
        const { error } = await this.client
            .from("knowledge_base_articles")
            .insert({
                title: title,
                category: category,
                content: content,
                tags: tags,
                author_id: currentUser.id,
                is_published: isPublished
            });

        if (error) throw error;
    },

    // Update an existing KB article
    async updateArticle(id, title, category, content, tags, isPublished = true) {
        await this.init();

        const { error } = await this.client
            .from("knowledge_base_articles")
            .update({
                title: title,
                category: category,
                content: content,
                tags: tags,
                is_published: isPublished,
                updated_at: new Date()
            })
            .eq("id", id);

        if (error) throw error;
    },

    // Delete a KB article (uses SECURITY DEFINER RPC to bypass RLS)
    async deleteArticle(id) {
        await this.init();

        // Try via RPC function first (bypasses RLS)
        const { error: rpcErr } = await this.client
            .rpc('delete_kb_article', { article_id: id });

        if (rpcErr) {
            // RPC function not found — fallback to direct delete
            if (rpcErr.code === 'PGRST202' || rpcErr.message?.includes('Could not find')) {
                const { data, error } = await this.client
                    .from("knowledge_base_articles")
                    .delete()
                    .eq("id", id)
                    .select();
                if (error) throw error;
                if (!data || data.length === 0) {
                    throw new Error("quyền: Không có quyền xóa bài viết. Chạy SQL trong Supabase Dashboard để tạo function delete_kb_article.");
                }
            } else {
                throw rpcErr;
            }
        }
    }
};
