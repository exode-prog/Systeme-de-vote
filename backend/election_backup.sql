--
-- PostgreSQL database dump
--

\restrict eqXqtJ6ex3YPTcuiGeJBccoh0v96ikkV3NylbdTvQjtThxlrmo8SpMAknWocdCd

-- Dumped from database version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: annee_academique; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.annee_academique (
    id_anneeacademique integer NOT NULL,
    annee_debut integer NOT NULL,
    annee_fin integer NOT NULL
);


ALTER TABLE public.annee_academique OWNER TO master;

--
-- Name: annee_academique_id_anneeacademique_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.annee_academique_id_anneeacademique_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.annee_academique_id_anneeacademique_seq OWNER TO master;

--
-- Name: annee_academique_id_anneeacademique_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.annee_academique_id_anneeacademique_seq OWNED BY public.annee_academique.id_anneeacademique;


--
-- Name: candidat; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.candidat (
    id_candidat integer NOT NULL,
    programme text NOT NULL,
    id_classe integer NOT NULL,
    id_utilisateur integer NOT NULL
);


ALTER TABLE public.candidat OWNER TO master;

--
-- Name: candidat_id_candidat_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.candidat_id_candidat_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.candidat_id_candidat_seq OWNER TO master;

--
-- Name: candidat_id_candidat_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.candidat_id_candidat_seq OWNED BY public.candidat.id_candidat;


--
-- Name: classe; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.classe (
    id_classe integer NOT NULL,
    nom character varying(50) NOT NULL,
    id_filiere integer NOT NULL
);


ALTER TABLE public.classe OWNER TO master;

--
-- Name: classe_id_classe_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.classe_id_classe_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.classe_id_classe_seq OWNER TO master;

--
-- Name: classe_id_classe_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.classe_id_classe_seq OWNED BY public.classe.id_classe;


--
-- Name: commentaire; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.commentaire (
    id_commentaire integer NOT NULL,
    contenu text NOT NULL,
    id_utilisateur integer NOT NULL,
    id_election integer NOT NULL,
    id_candidat integer
);


ALTER TABLE public.commentaire OWNER TO master;

--
-- Name: commentaire_id_commentaire_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.commentaire_id_commentaire_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.commentaire_id_commentaire_seq OWNER TO master;

--
-- Name: commentaire_id_commentaire_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.commentaire_id_commentaire_seq OWNED BY public.commentaire.id_commentaire;


--
-- Name: cycle; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.cycle (
    id_cycle integer NOT NULL,
    nom character varying(50) NOT NULL
);


ALTER TABLE public.cycle OWNER TO master;

--
-- Name: cycle_id_cycle_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.cycle_id_cycle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cycle_id_cycle_seq OWNER TO master;

--
-- Name: cycle_id_cycle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.cycle_id_cycle_seq OWNED BY public.cycle.id_cycle;


--
-- Name: election; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.election (
    id_election integer NOT NULL,
    nom character varying(100) NOT NULL,
    statut character varying(20) NOT NULL,
    id_anneeacademique integer NOT NULL,
    CONSTRAINT election_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'ouverte'::character varying, 'fermee'::character varying])::text[])))
);


ALTER TABLE public.election OWNER TO master;

--
-- Name: election_id_election_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.election_id_election_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.election_id_election_seq OWNER TO master;

--
-- Name: election_id_election_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.election_id_election_seq OWNED BY public.election.id_election;


--
-- Name: filiere; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.filiere (
    id_filiere integer NOT NULL,
    nom character varying(50) NOT NULL,
    id_niveau integer NOT NULL
);


ALTER TABLE public.filiere OWNER TO master;

--
-- Name: filiere_id_filiere_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.filiere_id_filiere_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.filiere_id_filiere_seq OWNER TO master;

--
-- Name: filiere_id_filiere_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.filiere_id_filiere_seq OWNED BY public.filiere.id_filiere;


--
-- Name: inscription; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.inscription (
    id_inscription integer NOT NULL,
    id_classe integer NOT NULL,
    id_anneeacademique integer NOT NULL,
    id_utilisateur integer NOT NULL
);


ALTER TABLE public.inscription OWNER TO master;

--
-- Name: inscription_id_inscription_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.inscription_id_inscription_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inscription_id_inscription_seq OWNER TO master;

--
-- Name: inscription_id_inscription_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.inscription_id_inscription_seq OWNED BY public.inscription.id_inscription;


--
-- Name: niveau; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.niveau (
    id_niveau integer NOT NULL,
    nom character varying(50) NOT NULL,
    id_cycle integer NOT NULL
);


ALTER TABLE public.niveau OWNER TO master;

--
-- Name: niveau_id_niveau_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.niveau_id_niveau_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.niveau_id_niveau_seq OWNER TO master;

--
-- Name: niveau_id_niveau_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.niveau_id_niveau_seq OWNED BY public.niveau.id_niveau;


--
-- Name: utilisateur; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.utilisateur (
    id_utilisateur integer NOT NULL,
    nom character varying(50) NOT NULL,
    prenom character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    mot_de_passe character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    CONSTRAINT utilisateur_role_check CHECK (((role)::text = ANY ((ARRAY['etudiant'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.utilisateur OWNER TO master;

--
-- Name: utilisateur_id_utilisateur_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.utilisateur_id_utilisateur_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.utilisateur_id_utilisateur_seq OWNER TO master;

--
-- Name: utilisateur_id_utilisateur_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.utilisateur_id_utilisateur_seq OWNED BY public.utilisateur.id_utilisateur;


--
-- Name: vote; Type: TABLE; Schema: public; Owner: master
--

CREATE TABLE public.vote (
    id_vote integer NOT NULL,
    id_candidat integer NOT NULL,
    id_utilisateur integer NOT NULL,
    id_election integer NOT NULL
);


ALTER TABLE public.vote OWNER TO master;

--
-- Name: vote_id_vote_seq; Type: SEQUENCE; Schema: public; Owner: master
--

CREATE SEQUENCE public.vote_id_vote_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vote_id_vote_seq OWNER TO master;

--
-- Name: vote_id_vote_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master
--

ALTER SEQUENCE public.vote_id_vote_seq OWNED BY public.vote.id_vote;


--
-- Name: annee_academique id_anneeacademique; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.annee_academique ALTER COLUMN id_anneeacademique SET DEFAULT nextval('public.annee_academique_id_anneeacademique_seq'::regclass);


--
-- Name: candidat id_candidat; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.candidat ALTER COLUMN id_candidat SET DEFAULT nextval('public.candidat_id_candidat_seq'::regclass);


--
-- Name: classe id_classe; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.classe ALTER COLUMN id_classe SET DEFAULT nextval('public.classe_id_classe_seq'::regclass);


--
-- Name: commentaire id_commentaire; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.commentaire ALTER COLUMN id_commentaire SET DEFAULT nextval('public.commentaire_id_commentaire_seq'::regclass);


--
-- Name: cycle id_cycle; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.cycle ALTER COLUMN id_cycle SET DEFAULT nextval('public.cycle_id_cycle_seq'::regclass);


--
-- Name: election id_election; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.election ALTER COLUMN id_election SET DEFAULT nextval('public.election_id_election_seq'::regclass);


--
-- Name: filiere id_filiere; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.filiere ALTER COLUMN id_filiere SET DEFAULT nextval('public.filiere_id_filiere_seq'::regclass);


--
-- Name: inscription id_inscription; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.inscription ALTER COLUMN id_inscription SET DEFAULT nextval('public.inscription_id_inscription_seq'::regclass);


--
-- Name: niveau id_niveau; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.niveau ALTER COLUMN id_niveau SET DEFAULT nextval('public.niveau_id_niveau_seq'::regclass);


--
-- Name: utilisateur id_utilisateur; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.utilisateur ALTER COLUMN id_utilisateur SET DEFAULT nextval('public.utilisateur_id_utilisateur_seq'::regclass);


--
-- Name: vote id_vote; Type: DEFAULT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.vote ALTER COLUMN id_vote SET DEFAULT nextval('public.vote_id_vote_seq'::regclass);


--
-- Data for Name: annee_academique; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.annee_academique (id_anneeacademique, annee_debut, annee_fin) FROM stdin;
1	2025	2026
\.


--
-- Data for Name: candidat; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.candidat (id_candidat, programme, id_classe, id_utilisateur) FROM stdin;
1	Je vais ameliorer la vie etudiante	1	1
\.


--
-- Data for Name: classe; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.classe (id_classe, nom, id_filiere) FROM stdin;
1	L1 Info	1
\.


--
-- Data for Name: commentaire; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.commentaire (id_commentaire, contenu, id_utilisateur, id_election, id_candidat) FROM stdin;
1	Bonne chance a tous les candidats	2	1	\N
2	Je soutiens ce candidat	2	1	1
3	Bonne chance a tous les candidats	2	1	\N
\.


--
-- Data for Name: cycle; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.cycle (id_cycle, nom) FROM stdin;
1	Licence
\.


--
-- Data for Name: election; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.election (id_election, nom, statut, id_anneeacademique) FROM stdin;
1	Election Bureau Etudiant 2025	ouverte	1
\.


--
-- Data for Name: filiere; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.filiere (id_filiere, nom, id_niveau) FROM stdin;
1	Informatique	1
\.


--
-- Data for Name: inscription; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.inscription (id_inscription, id_classe, id_anneeacademique, id_utilisateur) FROM stdin;
\.


--
-- Data for Name: niveau; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.niveau (id_niveau, nom, id_cycle) FROM stdin;
1	Licence 1	1
\.


--
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.utilisateur (id_utilisateur, nom, prenom, email, mot_de_passe, role) FROM stdin;
1	etudiant1	etudiant1	etudiant1@gmail.com	passer	etudiant
2	etudiant2	etudiant2	etudiant2@gmail.com	passer	etudiant
3	Paul	Paul	surveillant@gmail.com	passer	admin
\.


--
-- Data for Name: vote; Type: TABLE DATA; Schema: public; Owner: master
--

COPY public.vote (id_vote, id_candidat, id_utilisateur, id_election) FROM stdin;
1	1	2	1
\.


--
-- Name: annee_academique_id_anneeacademique_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.annee_academique_id_anneeacademique_seq', 1, true);


--
-- Name: candidat_id_candidat_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.candidat_id_candidat_seq', 1, true);


--
-- Name: classe_id_classe_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.classe_id_classe_seq', 1, true);


--
-- Name: commentaire_id_commentaire_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.commentaire_id_commentaire_seq', 3, true);


--
-- Name: cycle_id_cycle_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.cycle_id_cycle_seq', 1, true);


--
-- Name: election_id_election_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.election_id_election_seq', 1, true);


--
-- Name: filiere_id_filiere_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.filiere_id_filiere_seq', 1, true);


--
-- Name: inscription_id_inscription_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.inscription_id_inscription_seq', 1, false);


--
-- Name: niveau_id_niveau_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.niveau_id_niveau_seq', 1, true);


--
-- Name: utilisateur_id_utilisateur_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.utilisateur_id_utilisateur_seq', 3, true);


--
-- Name: vote_id_vote_seq; Type: SEQUENCE SET; Schema: public; Owner: master
--

SELECT pg_catalog.setval('public.vote_id_vote_seq', 1, true);


--
-- Name: annee_academique annee_academique_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.annee_academique
    ADD CONSTRAINT annee_academique_pkey PRIMARY KEY (id_anneeacademique);


--
-- Name: candidat candidat_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.candidat
    ADD CONSTRAINT candidat_pkey PRIMARY KEY (id_candidat);


--
-- Name: classe classe_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.classe
    ADD CONSTRAINT classe_pkey PRIMARY KEY (id_classe);


--
-- Name: commentaire commentaire_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.commentaire
    ADD CONSTRAINT commentaire_pkey PRIMARY KEY (id_commentaire);


--
-- Name: cycle cycle_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.cycle
    ADD CONSTRAINT cycle_pkey PRIMARY KEY (id_cycle);


--
-- Name: election election_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.election
    ADD CONSTRAINT election_pkey PRIMARY KEY (id_election);


--
-- Name: filiere filiere_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.filiere
    ADD CONSTRAINT filiere_pkey PRIMARY KEY (id_filiere);


--
-- Name: inscription inscription_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.inscription
    ADD CONSTRAINT inscription_pkey PRIMARY KEY (id_inscription);


--
-- Name: niveau niveau_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.niveau
    ADD CONSTRAINT niveau_pkey PRIMARY KEY (id_niveau);


--
-- Name: utilisateur utilisateur_email_key; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_email_key UNIQUE (email);


--
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id_utilisateur);


--
-- Name: vote vote_id_utilisateur_id_election_key; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT vote_id_utilisateur_id_election_key UNIQUE (id_utilisateur, id_election);


--
-- Name: vote vote_pkey; Type: CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT vote_pkey PRIMARY KEY (id_vote);


--
-- Name: candidat candidat_id_classe_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.candidat
    ADD CONSTRAINT candidat_id_classe_fkey FOREIGN KEY (id_classe) REFERENCES public.classe(id_classe);


--
-- Name: candidat candidat_id_utilisateur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.candidat
    ADD CONSTRAINT candidat_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) REFERENCES public.utilisateur(id_utilisateur);


--
-- Name: classe classe_id_filiere_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.classe
    ADD CONSTRAINT classe_id_filiere_fkey FOREIGN KEY (id_filiere) REFERENCES public.filiere(id_filiere);


--
-- Name: commentaire commentaire_id_candidat_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.commentaire
    ADD CONSTRAINT commentaire_id_candidat_fkey FOREIGN KEY (id_candidat) REFERENCES public.candidat(id_candidat);


--
-- Name: commentaire commentaire_id_election_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.commentaire
    ADD CONSTRAINT commentaire_id_election_fkey FOREIGN KEY (id_election) REFERENCES public.election(id_election);


--
-- Name: commentaire commentaire_id_utilisateur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.commentaire
    ADD CONSTRAINT commentaire_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) REFERENCES public.utilisateur(id_utilisateur);


--
-- Name: election election_id_anneeacademique_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.election
    ADD CONSTRAINT election_id_anneeacademique_fkey FOREIGN KEY (id_anneeacademique) REFERENCES public.annee_academique(id_anneeacademique);


--
-- Name: filiere filiere_id_niveau_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.filiere
    ADD CONSTRAINT filiere_id_niveau_fkey FOREIGN KEY (id_niveau) REFERENCES public.niveau(id_niveau);


--
-- Name: inscription inscription_id_anneeacademique_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.inscription
    ADD CONSTRAINT inscription_id_anneeacademique_fkey FOREIGN KEY (id_anneeacademique) REFERENCES public.annee_academique(id_anneeacademique);


--
-- Name: inscription inscription_id_classe_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.inscription
    ADD CONSTRAINT inscription_id_classe_fkey FOREIGN KEY (id_classe) REFERENCES public.classe(id_classe);


--
-- Name: inscription inscription_id_utilisateur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.inscription
    ADD CONSTRAINT inscription_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) REFERENCES public.utilisateur(id_utilisateur);


--
-- Name: niveau niveau_id_cycle_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.niveau
    ADD CONSTRAINT niveau_id_cycle_fkey FOREIGN KEY (id_cycle) REFERENCES public.cycle(id_cycle);


--
-- Name: vote vote_id_candidat_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT vote_id_candidat_fkey FOREIGN KEY (id_candidat) REFERENCES public.candidat(id_candidat);


--
-- Name: vote vote_id_election_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT vote_id_election_fkey FOREIGN KEY (id_election) REFERENCES public.election(id_election);


--
-- Name: vote vote_id_utilisateur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master
--

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT vote_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) REFERENCES public.utilisateur(id_utilisateur);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA public TO master;


--
-- PostgreSQL database dump complete
--

\unrestrict eqXqtJ6ex3YPTcuiGeJBccoh0v96ikkV3NylbdTvQjtThxlrmo8SpMAknWocdCd

