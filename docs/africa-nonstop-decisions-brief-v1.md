# Africa Nonstop — Decisions Brief

> Status key: **Confirmed** = agreed/current direction; **Open** = decision still required; **Idea** = discussed but not approved for implementation. Where documents conflict, the latest confirmed chat decision and SRS v2 take precedence over SRS v1.

## Product purpose

- **Confirmed:** Africa Nonstop is a destination discovery, trip-planning and human-assisted travel-orchestration platform. It combines a destination Guide, discoverable listings, the Nonstop Engine, traveller accounts, concierge/booking operations and administration.
- **Confirmed:** The core journey is **Discover → Save → Plan/Orchestrate → Request Booking → Human Confirmation/Fulfilment → Manage Trip → Concierge**. The listing is what the traveller discovers; the trip is what they build; the trip request is what operations confirms and fulfils.
- **Confirmed:** Primary commercial audience: international travellers considering or visiting Uganda. Initial pilots also serve people already in Uganda. Secondary users/beneficiaries are local operators/providers and Nonstop admin/concierge staff.
- **Confirmed:** The problem is fragmented destination knowledge, listings, logistics and support. The value is a coordinated, accessible mechanism that helps travellers discover, combine and safely experience more of Uganda, with accountable human support while automation matures.
- **Confirmed:** Nightlife is a pilot use case, not the product architecture.

## Brand and positioning

- **Confirmed:** **Africa Nonstop** is the wider platform/brand. **Kampala Nonstop** is the Uganda-facing destination brand. Uganda is the first and only market at launch; Kampala is the principal gateway and initial inventory scope, not the full geographic limit of the Uganda product.
- **Confirmed:** 2026 proposition: **“Get to Uganda, we’ll give you things to do.”** 2027/V1 proposition: **“We’ll get you to Uganda and fully support you there.”**
- **Confirmed:** Use locally informed, practical, curated and transparent language. Do not present V0 as a fully automated OTA: availability, price and fulfilment are human-confirmed.
- **Confirmed:** Use British English in product copy: *traveller, favourites, organise, neighbourhood*.
- **Proposed legal position:** **Nonstop Uganda Ltd trading as Kampala Nonstop** is the proposed Uganda owner/rights holder. Do not treat incorporation, assignment or parent-platform IP ownership as complete without legal confirmation.
- **Open:** Final public domain structure (`kampalanonstop.com` versus an Africa Nonstop Uganda path) and whether the supporting line **“an Africa Nonstop destination”** should appear under the Kampala Nonstop mark.
- **Open:** No formal brand-personality statement or final tagline beyond the dated campaign propositions above has been approved.

## Visual direction

- **Confirmed:** The public navbar is 56 px high on desktop, tablet and mobile, including its scrolled-state border.
- **Confirmed:** Website typeface is **Noto Sans KR**. **Working guideline:** use regular for body/UI and bold for headings, buttons and navigation, with hierarchy mainly through size and weight.
- **Rejected:** **Malgun Gothic** was replaced because its Microsoft licensing does not make it safe to assume the desktop font may be uploaded as a webfont.
- **Confirmed:** Responsive desktop, tablet and mobile UI. The approved mobile mock-up target is 420 px wide, full-page/scrollable, with no device frame and no horizontal scrollbar. Components and imagery must reflow as mobile layouts, not merely shrink.
- **Confirmed homepage treatments:** Template Itineraries and Featured Experiences replace the earlier Explore Category carousel; each uses a 3 × 2 desktop panel layout; image numbers are removed; each section has a containing section box. The post-hero three-panel group is called **Themes**.
- **Working recommendation, not locked:** Hero heading `clamp(40px, 5vw, 64px)`, about 64 px desktop and 40–44 px mobile, with tight line-height. Validate with Noto Sans KR before making it a design token.
- **Confirmed homepage hero treatment:** a six-image editorial slideshow covering Food & Local Life, Culture & Heritage, Music/Nightlife & Entertainment, Nature & Wildlife, Adventure & Outdoors, and Events & Festivals. Images remain still for one second, then cross-fade for two seconds. Each theme uses art-directed 3:2 desktop and 4:5 mobile imagery; the campaign copy and CTA remain static.
- **Confirmed homepage change:** the standalone **“What you'll discover” / “Nine ways to fall for the city”** section is removed; its editorial discovery role is carried by the hero slideshow.
- **Open:** No final colour palette, spacing scale, icon system, image treatment, component tokens or definitive hero type size is established in the available decisions. Preserve approved wireframe structure while these are resolved.

## Website and content

- **Confirmed desktop navigation:** **Home, Hot Picks, Discover, Guide, Support, Dashboard**, followed by heart/favourites, notification bell and **Plan My Trip**.
- **Confirmed homepage structure:** Hero; About Kampala Nonstop (three approved paragraphs introducing the Uganda-focused platform and local support), paired with Local Knowledge on the right at wide desktop widths; Trip Quiz; Themes (**Kampala Energy, Nature Access, Purpose-Led Travel**); Template Itineraries; Featured Experiences; **Discover Uganda Your Way**; footer. Themes are navigational/editorial groupings, not data entities.
- **Confirmed homepage About layout:** Preserve the About text width of 56rem (896px) in the left column, with inset Local Knowledge in the remaining right column of the 1400px container. Stack below 1400px to preserve readable widths; Local Knowledge retains its existing data-driven visibility.
- **Confirmed shared footer:** Show only a thin, centred copyright strip on desktop and mobile, with readable contrast and bottom safe-area spacing. Keep the branding, navigation, social links and email commented out until their destinations are ready. The Travel Guide return arrow must remain above the footer without covering its text.
- **Confirmed Guide overview cards:** Remove the Explore-page CTA text and arrow, including the unused GuideHubCard CTA field. Keep each entire card clickable with a persistent 2px primary-orange border.
- **Confirmed Guide overview bottom layout:** Pair the “Turn your ideas into a trip” panel on the left with inset Local Knowledge on the right, using the homepage 56rem left column and 1400px stacking breakpoint. Render Local Knowledge only once on the overview; retain the existing placement on Guide subpages except Travel Guide, which places it beside the topic panel.
- **Confirmed Travel Guide topic buttons:** Place each icon after the heading in the same row; remove the separate icon row and upper divider. Use content-driven heights and compact spacing beneath descriptions, retaining the lower line and arrow.
- **Confirmed Travel Guide return navigation:** On desktop and mobile, show a floating brown up arrow at the bottom right after all ten topic buttons have scrolled above the header. Return to the first topic button, respecting reduced-motion preferences; replace the mobile-only topic return bar.
- **Confirmed continuous Guide return navigation:** Essentials and Travel Information show the same floating brown up arrow on desktop and mobile once the first section heading scrolls above the reading area. Return to the first section with keyboard focus and reduced-motion support, keeping the arrow clear of the copyright footer.
- **Confirmed Travel Information layout:** Render all nine sections continuously with the same sticky desktop index and mobile selector/bottom sheet as Essentials, replacing the section buttons. Put “Visa-Free Entry” and “Visa Costs” together in the left column with Local Knowledge alongside both in the right column. Use flexible 2:1 columns at 1400px and above to accommodate the section index; stack on smaller screens. The “Ready when you are” panel spans the full page content width. Show the four visa cost cards in one desktop row, reflowing on smaller screens; prices use bold body-sized text.
- **Confirmed Travel Guide topic layout:** Remove the left icon/Travel Guide column. Place the topic icon immediately after the topic heading. Place the selected topic image above the two-column block, spanning the full content width. Pair the topic panel with inset Local Knowledge on the right, using the homepage 56rem left column and 1400px stacking breakpoint, without duplicating Local Knowledge below.
- **Confirmed Guide subpage navigation:** On Essentials, Travel Guide, Travel Information and Regions, show the existing Guide navigation buttons inside the hero below its title in place of breadcrumbs. Remove the separate navigation row below the hero; retain active-page highlighting. The published Guide overview has no breadcrumb.
- **Confirmed Essentials reference-page navigation:** Render all existing editorial topics and quick facts continuously, preserving API content, imagery and Local Knowledge. Use a sticky 240px “On this page” index from 768px upwards and a sticky selector with an accessible mobile bottom sheet below that breakpoint. Section links scroll with header offsets, expose the section being read, support hash and legacy `?section=` links, and preserve Back/Forward history without adding entries during passive scrolling. Essentials alone uses a 180px desktop hero beneath the 56px global header.
- **Confirmed Guide progressive loading:** Essentials renders its published snapshot immediately while refreshing live content. Essentials and Travel Information defer section photographs until they approach the viewport, with asynchronous decoding and reserved image space so reading and navigation do not wait for images.
- **Confirmed Essentials completeness correction:** Preserve all 12 original topic buttons, the History content previously nested under About, and quick facts. A single section collection drives both navigation and content (14 sections). Keep a complete snapshot of existing published Uganda content for API failure or missing records; live records override the snapshot. Query parameters and hashes must never filter the rendered inventory. See `docs/essentials-navigation-audit.md` for the recovered mapping.
- **Confirmed discovery entry question:** **“What brings you to Uganda?”** with four paths: **I know why I’m going; Help me decide; I already have dates; I only have a few free days.** The quiz captures traveller type, trip type, available time and what matters most, then presents three recommendations plus the full list, duration selection and **View My Trip**.
- **Confirmed orchestration order:** traveller/purpose context, dates and fixed anchors, then travel prerequisites (**flights → accommodation → visa → airport transfers/arrival**), followed by transport, experiences and concierge. Fixed events, weddings, meetings, permits and appointments configure a trip; they do not create separate product stacks.
- **Confirmed primary conversion CTA:** **Request Booking**. V0 submits a trip/service request for admin/concierge review; it does not promise instant booking or make online payment a launch gate.
- **Confirmed V0 surfaces/capabilities:** limited Uganda Guide and FAQ; Kampala-focused discovery/search/details; collections/lists; Local Gems and Hot Picks; trips and itinerary; request/status management; user dashboard; traveller–concierge messaging and notifications; admin-managed listings/content; operator/contact notes; banner advertising; Local Knowledge; waitlist/acquisition; future-ready payment architecture.
- **Confirmed waitlist rules:** wide desktop form; hero copy **“Join our wait list and win a return flight to Uganda”**; marketing consent at the bottom; no “anything else” field. Acquisition source is hidden and derived from landing context, UTM parameters, referral/QR/campaign links using controlled values where practical. Countries of interest is also a hidden form field. Store consent and attribution auditably.
- **Confirmed waitlist page layout:** Use a content-height hero with compact spacing above Early access beneath the fixed header. Place the form in the left 56rem column and inset Local Knowledge on the right within the 1400px container; stack below 1400px with the form first. Preserve the existing form fields and attribution.
- **Confirmed waitlist interest labels:** Food & Local Life; Culture & Heritage; Music, Nightlife & Entertainment; Nature & Wildlife; Adventure & Outdoors; Events & Festivals; Wellness & Relaxation; Sports & Recreation; Other. These are user-interest choices, not automatically the canonical catalogue categories.
- **Confirmed terminology:**

  | Term | Use |
  | --- | --- |
  | Activity | Real-world business/directory entity: something a traveller can do. |
  | Activity Type | Controlled classification of **what** the activity is. |
  | Event | Time-bound occurrence; Events/What’s On is a discovery view, not a primary category. |
  | Experience | Curated sequence/combination of activities; not a base entity. |
  | Tour | Structured route/touring product, potentially combining places, activities and services. |
  | Listing | Discoverable platform record wrapping a place, organisation, service, activity, tour or other entity. |
  | Hot Pick | Actively featured/editorial or commercial recommendation. |
  | Local Gem | Distinctive local listing underrepresented on mainstream platforms. |
  | Tag / Attribute | A related theme / a property-value. Neither replaces structural classification. |

- **Idea:** Natural-language requests such as “find me a Kampala comedy club tonight and a nightclub afterwards” are desirable, but were explicitly treated as potentially beyond V0.

## Technical decisions

- **Confirmed stack:** Angular frontend; PostgreSQL database; versioned REST/JSON APIs; blob/object storage for images/media. Angular is locked. PostgreSQL supersedes MySQL.
- **Open backend:** Laravel/PHP is the current proposal but remains subject to technical approval. Python was explored; no alternative was selected.
- **Confirmed environments/hosting shape:** two VPSs—production physically isolated on its own VPS; development, test and staging share a separate non-production VPS. Non-production uses one PostgreSQL server with separate databases/users per environment; production has its own PostgreSQL instance/database. Hosting provider and final managed-service choices remain open.
- **Confirmed deployment principles:** Git version control; separate dev/test/staging/production configuration; controlled promotion; responsive builds; API documentation (OpenAPI/Swagger recommended); automated testing, UAT and handover documentation.
- **Known development risk/recommendation:** The active Angular repo has been run inside Dropbox, which can lock Vite/Angular cache renames on Windows. Prefer a non-synchronised local repo with Git as the source-control mechanism; never version `.angular`, `node_modules` or `dist`.
- **Confirmed security baseline:** HTTPS; authentication and role/permission authorisation; protected admin/concierge endpoints; input validation; rate limiting; secure uploads; password hashing; CSRF/XSS protection where applicable; parameterised PostgreSQL access; audit logs; secrets/config separation; monitoring and backups.
- **Confirmed operations model:** Admin manages content initially. Use reusable service-request, assignment, status, notes, messaging and fulfilment workflows; broad concierge scope must not become a separate software flow per service. Accessibility, pacing and dietary requirements belong on traveller/trip context and flow into recommendations and provider verification.
- **Confirmed advertising:** Admin-managed campaigns with start/end dates, active state, approved predefined placement/size, uploaded creative, external link, impressions and clicks. No advertiser self-service or billing in V0.
- **Confirmed analytics requirement:** Track total waitlist sign-ups, those later registered, and conversion rate; also banner impressions/clicks and acquisition source. **Open:** analytics/CRM products and privacy implementation.
- **Confirmed data-model guardrails:** plural `snake_case` tables; `id` as PostgreSQL UUID primary key (UUIDv7 preferred for new IDs); stable reference `code`; `TIMESTAMPTZ` timestamps; separate `is_active` and `visibility`; soft-retire referenced data; junctions only for genuine many-to-many relationships. Canonical taxonomy is global where practical and destination availability is mapped, not duplicated.
- **Confirmed geography:** `countries` + controlled `geographic_area_types` + self-referencing `geographic_areas`; variable hierarchy depth; `destinations` is a separate product/business concept; `locations` stores precise addresses/coordinates. Canonical geography must not be auto-created from user/API/AI free text. Proximity should ultimately use coordinates.
- **Current planning assumption:** initial capacity baseline is 10,000 requests/day, modelled as roughly 100 API calls per session (~100 daily users). Validate before sizing production.
- **Not required for V0:** Firebase/Firestore; mandatory Redis/message queues; direct automated booking/payment; vendor self-service. Redis/cache/queues should be added only when workload justifies them. An Azure-based controlled AI planner was explored but is not a locked V0 dependency.

## Current priorities

- **Now (September 2026):** ship the campaign/waitlist acquisition layer with attributable source, interests, Uganda intent, consent, segmentation and follow-up; continue the Angular public experience.
- Translate the completed conceptual taxonomy into the physical PostgreSQL schema, constraints, migrations and seed/reference data. Produce ERD and API/page specifications from SRS v2—not v1.
- Lock the remaining foundations: backend framework, authentication/roles, API boundaries, UI/design system, CI/CD, monitoring, secrets, media delivery and detailed VPS deployment.
- Define V0 acceptance criteria for Guide, Discover, Nonstop Engine, account/dashboard, request/concierge operations, admin, communications, data/content operations, advertising and public acquisition.
- **Milestones:** Oct 2026 operational preparation; Nov 2026 limited V0 commercial pilot around Nyege Nyege Uganda; Dec 2026 V0.1 festive stress-test; Jan–Feb 2027 V0.5 international-trip hardening; **15 Mar 2027 V1 AFCON commercial release**; Apr–Jun scale; **19 Jun–17 Jul 2027 AFCON live operations**.
- **Do not change without discussion:** Uganda-first/Kampala-inventory scope; Angular/PostgreSQL; Noto Sans KR; the human-confirmed V0 flow; the canonical entity/taxonomy meanings; flexible geography model; current navigation/homepage structure; hidden acquisition attribution; production/non-production isolation.

## Open questions

- Approve Laravel or select another backend; define authentication/session approach, roles and permissions.
- Finalise the physical Trip/Itinerary/Trip Request/Booking schema; tour/activity/service normalisation; provider and multi-provider ownership; category/subcategory cardinality; attributes; destination-to-geography mapping; location/geocoder and possible PostGIS use.
- Choose hosting/provider details, CI/CD, monitoring/logging, secrets management, object storage/CDN, SMTP/transactional email, CRM and analytics tooling.
- Decide guest registration timing; trip editing/sharing; confirmation SLA; cancellations/refunds; pricing, taxes and fees; currency/payment gateway/manual payment; availability/capacity; vendor self-service, commission and payouts.
- Approve banner sizes/placement inventory and Local Knowledge content, placement triggers and rotation.
- Complete the visual system: palette, spacing, icons, image rules, responsive tokens and final hero typography.
- Decide when budget is requested in the trip flow; it should not add friction before useful recommendations unless required as a hard constraint.
- Decide whether/when natural-language trip search enters scope. It is an idea, not a V0 commitment.
- Confirm the final company/IP/domain arrangements and whether **“an Africa Nonstop destination”** is used as supporting brand copy.

## Source notes

- **Kampala_Nonstop_SRS_v2.pdf** (governing SRS; supersedes **Monir-Kampala_Nonstop_SRS.pdf** v1).
- **Kampala Nonstop Roadmap 2026–2027**; **Africa Nonstop — V0 Agile Project Tracker**; **Nonstop Full Data Model Taxonomy**; **Africa Nonstop — Conceptual Data Buckets & Classes**; **Africa Nonstop — Conceptual Data Model & Database Conventions**; **Africa Nonstop — Concierge Services & V0 Scope**.
- Key chats: *Concept Paper for Copyright* (27 Jul 2026); *Tech Stack & Misc*; *High-Level Database Design*; *Agile Project Planning*; *Roadmap Planning Milestones*; *Waitlist Interest Feature*; *Homepage Mockup Generation*; *Name Discovery Themes*; *Trip Orchestration Brainstorm*; *VPS Help*; and the website-font update replacing Malgun Gothic with Noto Sans KR.
