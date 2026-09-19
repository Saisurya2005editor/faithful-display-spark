# Prompt 3 roadmap — real data ingestion, demo mode, polish

- [x] DB: user_roles + has_role, analytics_events, admin write policies on documents/chunks
- [x] /admin/ingest: multi-PDF/text upload with parse → chunk → embed → store progress, metadata tagging
- [x] Indexed-documents table with chunk counts, delete, re-index
- [x] Citations: show "Verified source" vs "Sample" from real data_origin
- [x] Demo mode: Shift+D floating panel with 3 one-click demo queries
- [x] Chat: "How this answer was generated" expandable panel with chunks + similarity scores
- [x] /admin/insights: questions, top products, languages, avg confidence, feedback ratio
- [x] Onboarding tooltip tour for first-time users
- [x] Polish: page transitions, mobile check
- [x] Verify: typecheck + Playwright pass on new flows

All Prompt 3 items done and verified in preview. Remaining (user action): upload 20–30 real BIS PDFs via /admin/ingest, then publish.
