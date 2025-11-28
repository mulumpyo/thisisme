-- DROP
DROP TABLE IF EXISTS "user_templates" CASCADE;
DROP TABLE IF EXISTS "project_links" CASCADE;
DROP TABLE IF EXISTS "skills" CASCADE;
DROP TABLE IF EXISTS "user_skills" CASCADE;
DROP TABLE IF EXISTS "project_skills" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "templates" CASCADE;
DROP TABLE IF EXISTS "user_links" CASCADE;
DROP TABLE IF EXISTS "skill_category" CASCADE;

-- CREATE TABLES
CREATE TABLE "user_templates" (
    "user_id"        UUID        NOT NULL,
    "template_id"    UUID        NOT NULL,
    "saved_at"       TIMESTAMP   DEFAULT NOW()    NOT NULL
);
COMMENT ON COLUMN "user_templates"."saved_at" IS '업데이트시 수정 로직 필요';

CREATE TABLE "project_links" (
    "link_id"        UUID        DEFAULT gen_random_uuid() NOT NULL,
    "project_id"     UUID        NOT NULL,
    "type"           TEXT        NOT NULL,
    "url"            TEXT        NOT NULL,
    "display_name"   TEXT        NOT NULL,
    "order_index"    INT         NOT NULL
);

CREATE TABLE "skills" (
    "skill_id"       UUID        DEFAULT gen_random_uuid() NOT NULL,
    "category_id"    UUID        NOT NULL,
    "name"           TEXT        NOT NULL
);

CREATE TABLE "user_skills" (
    "user_id"        UUID        NOT NULL,
    "skill_id"       UUID        NOT NULL,
    "order_index"    INT         NOT NULL
);

CREATE TABLE "project_skills" (
    "project_id"     UUID        NOT NULL,
    "skill_id"       UUID        NOT NULL,
    "order_index"    INT         NOT NULL
);

CREATE TABLE "projects" (
    "project_id"     UUID        DEFAULT gen_random_uuid() NOT NULL,
    "user_id"        UUID        NOT NULL,
    "title"          TEXT        NOT NULL,
    "description"    TEXT        NOT NULL,
    "order_index"    INT         NOT NULL
);

CREATE TABLE "users" (
    "user_id"             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "email"               TEXT UNIQUE NOT NULL,
    "username"            TEXT UNIQUE NOT NULL,
    "avatar_url"          TEXT        NULL,
    "bio"                 TEXT        NULL,
    "created_at"          TIMESTAMP   DEFAULT NOW()    NOT NULL,
    "role"                INT         DEFAULT 1        NOT NULL,
    "current_template_id" UUID        NULL
);
COMMENT ON COLUMN "users"."role" IS '0: admin, 1: user';

CREATE TABLE "templates" (
    "template_id"    UUID        DEFAULT gen_random_uuid() NOT NULL,
    "owner_id"       UUID        NOT NULL,
    "name"           TEXT        NOT NULL,
    "description"    TEXT        NULL,
    "path"           TEXT        NOT NULL,
    "created_at"     TIMESTAMP   DEFAULT NOW()    NOT NULL
);

CREATE TABLE "user_links" (
    "link_id"        UUID        DEFAULT gen_random_uuid() NOT NULL,
    "user_id"        UUID        NOT NULL,
    "icon"           TEXT        NULL,
    "url"            TEXT        NOT NULL,
    "display_name"   TEXT        NOT NULL,
    "order_index"    INT         NOT NULL
);

CREATE TABLE "skill_category" (
    "category_id"    UUID        DEFAULT gen_random_uuid() NOT NULL,
    "name"           TEXT        NOT NULL
);

-- PK
ALTER TABLE "user_templates" ADD CONSTRAINT "PK_USER_TEMPLATES" PRIMARY KEY ("user_id", "template_id");
ALTER TABLE "project_links" ADD CONSTRAINT "PK_PROJECT_LINKS" PRIMARY KEY ("link_id");
ALTER TABLE "skills" ADD CONSTRAINT "PK_SKILLS" PRIMARY KEY ("skill_id");
ALTER TABLE "user_skills" ADD CONSTRAINT "PK_USER_SKILLS" PRIMARY KEY ("user_id", "skill_id");
ALTER TABLE "project_skills" ADD CONSTRAINT "PK_PROJECT_SKILLS" PRIMARY KEY ("project_id", "skill_id");
ALTER TABLE "projects" ADD CONSTRAINT "PK_PROJECTS" PRIMARY KEY ("project_id");
ALTER TABLE "users" ADD CONSTRAINT "PK_USERS" PRIMARY KEY ("user_id");
ALTER TABLE "templates" ADD CONSTRAINT "PK_TEMPLATES" PRIMARY KEY ("template_id");
ALTER TABLE "user_links" ADD CONSTRAINT "PK_USER_LINKS" PRIMARY KEY ("link_id");
ALTER TABLE "skill_category" ADD CONSTRAINT "PK_SKILL_CATEGORY" PRIMARY KEY ("category_id");

-- FK
ALTER TABLE "user_templates" ADD CONSTRAINT "FK_users_TO_user_templates_1" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;
ALTER TABLE "user_templates" ADD CONSTRAINT "FK_templates_TO_user_templates_1" FOREIGN KEY ("template_id") REFERENCES "templates" ("template_id") ON DELETE CASCADE;
ALTER TABLE "project_links" ADD CONSTRAINT "FK_projects_TO_project_links_1" FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id") ON DELETE CASCADE;
ALTER TABLE "skills" ADD CONSTRAINT "FK_skill_category_TO_skills_1" FOREIGN KEY ("category_id") REFERENCES "skill_category" ("category_id") ON DELETE CASCADE;
ALTER TABLE "user_skills" ADD CONSTRAINT "FK_users_TO_user_skills_1" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;
ALTER TABLE "user_skills" ADD CONSTRAINT "FK_skills_TO_user_skills_1" FOREIGN KEY ("skill_id") REFERENCES "skills" ("skill_id") ON DELETE CASCADE;
ALTER TABLE "project_skills" ADD CONSTRAINT "FK_projects_TO_project_skills_1" FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id") ON DELETE CASCADE;
ALTER TABLE "project_skills" ADD CONSTRAINT "FK_skills_TO_project_skills_1" FOREIGN KEY ("skill_id") REFERENCES "skills" ("skill_id") ON DELETE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "FK_users_TO_projects_1" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "FK_templates_TO_users_1" FOREIGN KEY ("current_template_id") REFERENCES "templates" ("template_id");
ALTER TABLE "templates" ADD CONSTRAINT "FK_users_TO_templates_1" FOREIGN KEY ("owner_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;
ALTER TABLE "user_links" ADD CONSTRAINT "FK_users_TO_user_links_1" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;

-- RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skill_category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_links" ENABLE ROW LEVEL SECURITY;

-- [정책 1] Users
CREATE POLICY "Users viewable by everyone" ON "users" FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON "users" FOR UPDATE USING (auth.uid() = "user_id");

-- [정책 2] User Data
CREATE POLICY "Projects viewable by everyone" ON "projects" FOR SELECT USING (true);
CREATE POLICY "Projects managed by owner" ON "projects" FOR ALL USING (auth.uid() = "user_id");
CREATE POLICY "User links viewable by everyone" ON "user_links" FOR SELECT USING (true);
CREATE POLICY "User links managed by owner" ON "user_links" FOR ALL USING (auth.uid() = "user_id");
CREATE POLICY "User skills viewable by everyone" ON "user_skills" FOR SELECT USING (true);
CREATE POLICY "User skills managed by owner" ON "user_skills" FOR ALL USING (auth.uid() = "user_id");
CREATE POLICY "Project links viewable by everyone" ON "project_links" FOR SELECT USING (true);

-- Project Links는 Project의 소유자가 관리
CREATE POLICY "Project links managed by project owner" ON "project_links" FOR ALL USING (
    EXISTS (SELECT 1 FROM "projects" WHERE "projects"."project_id" = "project_links"."project_id" AND "projects"."user_id" = auth.uid())
);

CREATE POLICY "Project skills viewable by everyone" ON "project_skills" FOR SELECT USING (true);
CREATE POLICY "Project skills managed by project owner" ON "project_skills" FOR ALL USING (
    EXISTS (SELECT 1 FROM "projects" WHERE "projects"."project_id" = "project_skills"."project_id" AND "projects"."user_id" = auth.uid())
);

-- [정책 3] 기준 정보
CREATE POLICY "Skills viewable by everyone" ON "skills" FOR SELECT USING (true);
CREATE POLICY "Skills managed by admin" ON "skills" FOR ALL USING (
    (SELECT "role" FROM "users" WHERE "user_id" = auth.uid()) = 0
);

CREATE POLICY "Categories viewable by everyone" ON "skill_category" FOR SELECT USING (true);
CREATE POLICY "Categories managed by admin" ON "skill_category" FOR ALL USING (
    (SELECT "role" FROM "users" WHERE "user_id" = auth.uid()) = 0
);

CREATE POLICY "Templates viewable by everyone" ON "templates" FOR SELECT USING (true);
CREATE POLICY "Templates managed by admin or owner" ON "templates" FOR ALL USING (
    (SELECT "role" FROM "users" WHERE "user_id" = auth.uid()) = 0 OR auth.uid() = "owner_id"
);