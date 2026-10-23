CREATE TYPE "public"."estado_envio" AS ENUM('pendiente', 'generado', 'enviado_simulado', 'fallido');--> statement-breakpoint
CREATE TYPE "public"."estado_peticion" AS ENUM('borrador', 'abierta', 'umbral_alcanzado', 'enviada', 'cerrada');--> statement-breakpoint
CREATE TYPE "public"."nivel_jurisdiccion" AS ENUM('federacion', 'entidad', 'alcaldia', 'unidad_territorial', 'circunscripcion', 'distrito_federal', 'distrito_local');--> statement-breakpoint
CREATE TABLE "envios" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"peticion_id" bigint NOT NULL,
	"estado" "estado_envio" DEFAULT 'pendiente' NOT NULL,
	"hash_pdf" "bytea",
	"hash_acuse" "bytea",
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"enviado_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "firmas" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"peticion_id" bigint NOT NULL,
	"persona_id" bigint NOT NULL,
	"secuencia" integer NOT NULL,
	"hoja" "bytea" NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "firmas_peticion_id_persona_id_unique" UNIQUE("peticion_id","persona_id"),
	CONSTRAINT "firmas_peticion_id_secuencia_unique" UNIQUE("peticion_id","secuencia")
);
--> statement-breakpoint
CREATE TABLE "jurisdicciones" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"nivel" "nivel_jurisdiccion" NOT NULL,
	"padre_id" bigint,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"configuracion" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "jurisdicciones_nivel_codigo_unique" UNIQUE("nivel","codigo")
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"curp_hmac" text NOT NULL,
	"nombre_cifrado" "bytea" NOT NULL,
	"curp_cifrada" "bytea",
	"entidad" smallint NOT NULL,
	"seccion" integer NOT NULL,
	"verificado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "personas_curp_hmac_unique" UNIQUE("curp_hmac")
);
--> statement-breakpoint
CREATE TABLE "peticiones" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"texto" text NOT NULL,
	"categoria" text NOT NULL,
	"jurisdiccion_id" bigint NOT NULL,
	"umbral" integer NOT NULL,
	"estado" "estado_peticion" DEFAULT 'abierta' NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "peticiones_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "raices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"peticion_id" bigint NOT NULL,
	"tamano" integer NOT NULL,
	"raiz" "bytea" NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "raices_peticion_id_tamano_unique" UNIQUE("peticion_id","tamano")
);
--> statement-breakpoint
CREATE TABLE "secciones_electorales" (
	"entidad" smallint NOT NULL,
	"seccion" integer NOT NULL,
	"alcaldia_id" bigint NOT NULL,
	"distrito_federal_id" bigint NOT NULL,
	"distrito_local_id" bigint NOT NULL,
	"distritacion" text NOT NULL,
	CONSTRAINT "secciones_electorales_entidad_seccion_pk" PRIMARY KEY("entidad","seccion")
);
--> statement-breakpoint
ALTER TABLE "envios" ADD CONSTRAINT "envios_peticion_id_peticiones_id_fk" FOREIGN KEY ("peticion_id") REFERENCES "public"."peticiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firmas" ADD CONSTRAINT "firmas_peticion_id_peticiones_id_fk" FOREIGN KEY ("peticion_id") REFERENCES "public"."peticiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firmas" ADD CONSTRAINT "firmas_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdicciones" ADD CONSTRAINT "jurisdicciones_padre_id_jurisdicciones_id_fk" FOREIGN KEY ("padre_id") REFERENCES "public"."jurisdicciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peticiones" ADD CONSTRAINT "peticiones_jurisdiccion_id_jurisdicciones_id_fk" FOREIGN KEY ("jurisdiccion_id") REFERENCES "public"."jurisdicciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raices" ADD CONSTRAINT "raices_peticion_id_peticiones_id_fk" FOREIGN KEY ("peticion_id") REFERENCES "public"."peticiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secciones_electorales" ADD CONSTRAINT "secciones_electorales_alcaldia_id_jurisdicciones_id_fk" FOREIGN KEY ("alcaldia_id") REFERENCES "public"."jurisdicciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secciones_electorales" ADD CONSTRAINT "secciones_electorales_distrito_federal_id_jurisdicciones_id_fk" FOREIGN KEY ("distrito_federal_id") REFERENCES "public"."jurisdicciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secciones_electorales" ADD CONSTRAINT "secciones_electorales_distrito_local_id_jurisdicciones_id_fk" FOREIGN KEY ("distrito_local_id") REFERENCES "public"."jurisdicciones"("id") ON DELETE no action ON UPDATE no action;