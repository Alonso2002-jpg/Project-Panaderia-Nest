DROP TABLE IF EXISTS "category";
DROP SEQUENCE IF EXISTS category_id_seq;
CREATE SEQUENCE category_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."category" (
                                     "id" integer DEFAULT nextval('category_id_seq') NOT NULL,
                                     "nameCategory" character varying(255) NOT NULL,
                                     "created_at" timestamp DEFAULT now() NOT NULL,
                                     "updated_at" timestamp DEFAULT now() NOT NULL,
                                     "is_deleted" boolean DEFAULT false NOT NULL,
                                     CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"),
                                     CONSTRAINT "UQ_e3caecf58bdabc8c17e120175e7" UNIQUE ("nameCategory")
) WITH (oids = false);

INSERT INTO "category" ("id", "nameCategory", "created_at", "updated_at", "is_deleted") VALUES
                                                                                            (2,	'Candies',	'2024-02-10 18:49:34.362278',	'2024-02-10 18:49:34.362278',	'f'),
                                                                                            (3,	'Drinks',	'2024-02-10 18:49:45.516215',	'2024-02-10 18:49:45.516215',	'f'),
                                                                                            (4,	'Utensils',	'2024-02-10 18:50:01.820636',	'2024-02-10 18:50:01.820636',	'f'),
                                                                                            (5,	'Bakery',	'2024-02-10 18:50:19.533131',	'2024-02-10 18:50:19.533131',	'f'),
                                                                                            (6,	'Customer service',	'2024-02-10 18:50:39.654317',	'2024-02-10 18:50:39.654317',	'f'),
                                                                                            (7,	'Cleaning',	'2024-02-10 18:50:58.581171',	'2024-02-10 18:50:58.581171',	'f'),
                                                                                            (8,	'Delivery',	'2024-02-10 18:51:11.365575',	'2024-02-10 18:51:11.365575',	'f'),
                                                                                            (9,	'Wholesaler',	'2024-02-10 18:51:41.607756',	'2024-02-10 18:51:41.607756',	'f'),
                                                                                            (10,	'Supplier',	'2024-02-10 18:51:58.631583',	'2024-02-10 18:51:58.631583',	'f'),
                                                                                            (1,	'Casher',	'2024-02-10 18:52:31.639307',	'2024-02-10 18:52:31.639307',	'f'),
                                                                                            (12,	'Breads',	'2024-02-10 19:06:03.808511',	'2024-02-10 19:06:03.808511',	'f');

DROP TABLE IF EXISTS "personal";
CREATE TABLE "public"."personal" (
                                     "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
                                     "name" character varying NOT NULL,
                                     "dni" character varying NOT NULL,
                                     "email" character varying NOT NULL,
                                     "start_date" timestamp DEFAULT now() NOT NULL,
                                     "end_date" timestamp,
                                     "creation_date" timestamp DEFAULT now() NOT NULL,
                                     "update_date" timestamp DEFAULT now() NOT NULL,
                                     "active" boolean DEFAULT true NOT NULL,
                                     "user_id" bigint,
                                     "section" integer,
                                     CONSTRAINT "PK_7a849a61cdfe8eee39892d7b1b1" PRIMARY KEY ("id"),
                                     CONSTRAINT "REL_4566359c5351885ac6ceb0e19a" UNIQUE ("user_id"),
                                     CONSTRAINT "UQ_70d5093c89e28f09e712a6ab572" UNIQUE ("email"),
                                     CONSTRAINT "UQ_7cd67e66979a904324a56a17002" UNIQUE ("dni")
) WITH (oids = false);

INSERT INTO "personal" ("id", "name", "dni", "email", "start_date", "end_date", "creation_date", "update_date", "active", "user_id", "section") VALUES
                                                                                                                                                    ('464a9c8f-09fc-4472-8a47-ab2cf5b38233',	'Juan Pérez',	'12345678A',	'juanperez@migadeoro.com',	'2024-02-10 19:58:32.511148',	NULL,	'2024-02-10 19:58:32.511148',	'2024-02-10 19:58:32.511148',	't',	2,	5),
                                                                                                                                                    ('37a5a410-8fb9-4d79-b261-f705e15e8414',	'María López',	'23456789B',	'maria@migadeoro.com',	'2024-02-10 20:01:42.724158',	NULL,	'2024-02-10 20:01:42.724158',	'2024-02-10 20:01:42.724158',	't',	3,	6),
                                                                                                                                                    ('02bff0b0-9506-4013-abc2-d7527d7fd6b2',	'Pedro Rodríguez',	'34567891C',	'pedro@migadeoro.com',	'2024-02-10 20:04:31.047468',	NULL,	'2024-02-10 20:04:31.047468',	'2024-02-10 20:04:31.047468',	't',	4,	6),
                                                                                                                                                    ('4465bc2d-80ce-4b9a-9025-5fb8e6769219',	'Laura García',	'45678912D',	'lau@migadeoro.com',	'2024-02-10 20:07:31.533495',	NULL,	'2024-02-10 20:07:31.533495',	'2024-02-10 20:07:31.533495',	't',	5,	7),
                                                                                                                                                    ('b628550a-2a53-4178-ba67-4227d2c9027e',	'Carlos Martínez',	'56789123E',	'carlos@migadeoro.com',	'2024-02-10 20:11:41.897841',	NULL,	'2024-02-10 20:11:41.897841',	'2024-02-10 20:11:41.897841',	't',	6,	8);

DROP TABLE IF EXISTS "products";
CREATE TABLE "public"."products" (
                                     "id" uuid NOT NULL,
                                     "name" character varying(255) NOT NULL,
                                     "price" double precision DEFAULT '0' NOT NULL,
                                     "stock" integer DEFAULT '0' NOT NULL,
                                     "image" text DEFAULT 'https://via.placeholder.com/150' NOT NULL,
                                     "created_at" timestamp DEFAULT now() NOT NULL,
                                     "updated_at" timestamp DEFAULT now() NOT NULL,
                                     "is_deleted" boolean DEFAULT false NOT NULL,
                                     "category_id" integer,
                                     "provider_id" integer,
                                     CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"),
                                     CONSTRAINT "UQ_4c9fb58de893725258746385e16" UNIQUE ("name")
) WITH (oids = false);

INSERT INTO "products" ("id", "name", "price", "stock", "image", "created_at", "updated_at", "is_deleted", "category_id", "provider_id") VALUES
                                                                                                                                             ('f1c3f5a4-bebd-4619-b136-ba2bcfbd5c9a',	'Milk Bread',	2.5,	100,	'https://via.placeholder.com/150',	'2024-02-10 19:07:02.672318',	'2024-02-10 19:07:02.672318',	'f',	12,	2),
                                                                                                                                             ('8f1849c9-8885-4b3f-bd82-d919d585ce04',	'Chocolate Cookies',	3,	150,	'https://via.placeholder.com/150',	'2024-02-10 19:09:51.526924',	'2024-02-10 19:09:51.526924',	'f',	2,	1),
                                                                                                                                             ('44f01f9a-db5b-4dbf-aff4-074644a0391e',	'Mineral Water',	1,	200,	'https://via.placeholder.com/150',	'2024-02-10 19:12:09.895392',	'2024-02-10 19:12:09.895392',	'f',	3,	3),
                                                                                                                                             ('207e2679-defb-4944-9791-fc270fa62669',	'Coffee Cup',	5,	50,	'https://via.placeholder.com/150',	'2024-02-10 19:15:29.412109',	'2024-02-10 19:15:29.412109',	'f',	3,	3);

DROP TABLE IF EXISTS "providers";
DROP SEQUENCE IF EXISTS providers_id_seq;
CREATE SEQUENCE providers_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."providers" (
                                      "NIF" character varying(9) NOT NULL,
                                      "number" character varying NOT NULL,
                                      "type" integer,
                                      "Name" character varying(50) NOT NULL,
                                      "CreationDate" timestamp DEFAULT now() NOT NULL,
                                      "UpdateDate" timestamp DEFAULT now() NOT NULL,
                                      "id" integer DEFAULT nextval('providers_id_seq') NOT NULL,
                                      CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "providers" ("NIF", "number", "type", "Name", "CreationDate", "UpdateDate", "id") VALUES
                                                                                                  ('12345678A',	'123456789',	9,	'Sweet Distributions',	'2024-02-10 18:55:12.771199',	'2024-02-10 18:55:12.771199',	1),
                                                                                                  ('98765432B',	'987654321',	10,	'Flour and More',	'2024-02-10 18:57:14.399494',	'2024-02-10 18:57:14.399494',	2),
                                                                                                  ('87654321C',	'123987456',	10,	'Drink Suppliers',	'2024-02-10 18:58:27.746778',	'2024-02-10 18:58:27.746778',	3),
                                                                                                  ('34567891D',	'654321789',	10,	'Utensil Suppliers',	'2024-02-10 18:59:05.531924',	'2024-02-10 18:59:05.531924',	4);

DROP TABLE IF EXISTS "user_roles";
DROP SEQUENCE IF EXISTS user_roles_id_seq;
CREATE SEQUENCE user_roles_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."user_roles" (
                                       "id" integer DEFAULT nextval('user_roles_id_seq') NOT NULL,
                                       "role" character varying(50) DEFAULT 'USER' NOT NULL,
                                       "user_id" bigint,
                                       CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "user_roles" ("id", "role", "user_id") VALUES
                                                       (1,	'USER',	1),
                                                       (2,	'ADMIN',	1),
                                                       (3,	'USER',	2),
                                                       (4,	'USER',	3),
                                                       (5,	'USER',	4),
                                                       (6,	'SELLER',	4),
                                                       (7,	'USER',	5),
                                                       (8,	'SELLER',	5),
                                                       (9,	'USER',	6);

DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."users" (
                                  "id" bigint DEFAULT nextval('users_id_seq') NOT NULL,
                                  "name" character varying(255) NOT NULL,
                                  "lastname" character varying(255) NOT NULL,
                                  "email" character varying(255) NOT NULL,
                                  "username" character varying(255) NOT NULL,
                                  "password" character varying(255) NOT NULL,
                                  "created_at" timestamp DEFAULT now() NOT NULL,
                                  "updated_at" timestamp DEFAULT now() NOT NULL,
                                  "is_deleted" boolean DEFAULT false NOT NULL,
                                  CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"),
                                  CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                                  CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")
) WITH (oids = false);

INSERT INTO "users" ("id", "name", "lastname", "email", "username", "password", "created_at", "updated_at", "is_deleted") VALUES
                                                                                                                              -- PASSWORD: Admin1
                                                                                                                              (1,	'Admin',	'Admin',	'admin@migadeoro.com',	'admin',	'$2a$10$vPaqZvZkz6jhb7U7k/V/v.5vprfNdOnh4sxi/qpPRkYTzPmFlI9p2',	'2024-02-10 19:20:56.511283',	'2024-02-10 19:20:56.511283',	'f'),
                                                                                                                              -- PASSWORD: juPerez678A
                                                                                                                              (2,	'Juan',	'Perez',	'juanperez@migadeoro.com',	'12345678A',	'$2a$12$ux3Sl5qmI.k.zcU4MQzDDOcMKy5a3V0AR0FwC8av4fmT0okVkQ3Na',	'2024-02-10 19:39:27.223601',	'2024-02-10 19:39:27.223601',	'f'),
                                                                                                                              -- PASSWORD: maRodriguez789B
                                                                                                                              (3,	'Maria',	'Rodriguez',	'maria@migadeoro.com',	'23456789B',	'$2a$12$9Dhn3uIDg7yvOfZlxAuV8OEJz7.ot3ZWurdDJaxjYLBJAGI0NAfDW',	'2024-02-10 19:43:01.252426',	'2024-02-10 19:43:01.252426',	'f'),
                                                                                                                              -- PASSWORD: laGarcia912D
                                                                                                                              (5,	'Laura',	'Gimenez',	'lau@migadeoro.com',	'45678912D',	'$2a$12$ZFP7Houa8nOosSbldsYPJ.wDmNuIASWzZbAh6E3cR5xQmXLX4CrM6',	'2024-02-10 19:48:08.360155',	'2024-02-10 19:48:08.360155',	'f'),
                                                                                                                              -- PASSWORD: peRodriguez891C
                                                                                                                              (4,	'Pedro',	'Gutierrez',	'pedro@migadeoro.com',	'34567891C',	'$2a$12$9ShIl0bN8rQankUlRvsav.4ohOzvo1Xgc10qRKhzVShX0reUdxVnq',	'2024-02-10 19:44:30.229096',	'2024-02-10 19:44:30.229096',	'f'),
                                                                                                                              -- PASSWORD: caMartinez123E
                                                                                                                              (6,	'Carlos',	'Martinez',	'carlos@migadeoro.com',	'56789123E',	'$2a$12$q6AMQQkdmxdim559dQ/nIuF3RX3Nfvr267sEv9BZLItt3kJCGYFyW',	'2024-02-10 19:50:39.513835',	'2024-02-10 19:50:39.513835',	'f');

ALTER TABLE ONLY "public"."personal" ADD CONSTRAINT "FK_4566359c5351885ac6ceb0e19a4" FOREIGN KEY (user_id) REFERENCES users(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."personal" ADD CONSTRAINT "FK_85bf0b31be4d29730ee08392ef4" FOREIGN KEY (section) REFERENCES category(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."products" ADD CONSTRAINT "FK_487f08da85a58f1fa47863a9474" FOREIGN KEY (provider_id) REFERENCES providers(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY (category_id) REFERENCES category(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."providers" ADD CONSTRAINT "FK_06250375d112fc6ec96ca3ee7c4" FOREIGN KEY (type) REFERENCES category(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY (user_id) REFERENCES users(id) NOT DEFERRABLE;