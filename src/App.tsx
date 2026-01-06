import { Suspense, useEffect, useState } from "react";
import { useContentStore } from "./cms/contentStore";
import { supabase } from "./cms/supabaseClient";
import Header from "./components/Header";
import DynamicSection from "./components/DynamicSection";
import Footer from "./components/Footer";
import { loadTranslations } from "./cms/loadTranslation";
import ChatBot from './chat-bot/ChatBot';
import "./Admin.css";
import "./MainSite.css";

interface SectionItem {
  id: string;
  item_type: string;
  content_key_badge?: string;
  content_key_title?: string;
  content_key_text?: string;
  icon_text?: string;
  order_index: number;
  metadata?: any;
}

interface Section {
  id: string;
  section_key: string;
  section_type: string;
  order_index: number;
  css_classes: string;
  grid_columns?: number;
  items: SectionItem[];
}

export default function MainSite() {
  const isReady = useContentStore((s) => s.isReady);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);

  useEffect(() => {
    const savedLang = (localStorage.getItem("language") as "ru" | "kz") || "ru";
    loadTranslations(savedLang);
  }, []);

  useEffect(() => {
    if (isReady) {
      loadSections();
    }
  }, [isReady]);

  const loadSections = async () => {
    const { data: homePage, error: homePageError } = await supabase
      .from("pages")
      .select("id")
      .eq("is_home", true)
      .eq("is_active", true)
      .single();

    if (homePageError && homePageError.code !== 'PGRST116') { 
      console.error("Error fetching home page:", homePageError);
      setSectionsLoaded(true);
      return;
    }

    if (!homePage) {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select(`
          *,
          items:section_items (
            *
          )
        `)
        .eq("is_active", true)
        .order("order_index");

      if (sectionsError) {
        console.error("Error fetching sections:", sectionsError);
      } else if (sectionsData) {
        setSections(sectionsData);
      }
      setSectionsLoaded(true);
      return;
    }

    const { data: pageSections, error: pageSectionsError } = await supabase
      .from("page_sections")
      .select("section_id, order_index")
      .eq("page_id", homePage.id)
      .eq("is_visible", true);

    if (pageSectionsError) {
      console.error("Error fetching page sections:", pageSectionsError);
      setSectionsLoaded(true);
      return;
    }

    if (!pageSections || pageSections.length === 0) {
      setSectionsLoaded(true);
      return;
    }

    const sectionIds = pageSections.map((ps) => ps.section_id);

    const { data: sectionsData, error: sectionsError } = await supabase
      .from("sections")
      .select(`
        *,
        items:section_items (
          *
        )
      `)
      .in("id", sectionIds)
      .eq("is_active", true);

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      setSectionsLoaded(true);
      return;
    }
    
    if (sectionsData) {
      const orderMap = new Map(pageSections.map(ps => [ps.section_id, ps.order_index]));
      const sortedSections = sectionsData.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
      setSections(sortedSections);
    }

    setSectionsLoaded(true);
  };

  useEffect(() => {
    if (!sectionsLoaded) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest && (target.closest('a[href^="#"]') as HTMLAnchorElement | null);
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      e.preventDefault();

      const element = document.querySelector(href) as HTMLElement | null;
      if (!element) return;

      const header = document.querySelector("header") as HTMLElement | null;
      const headerHeight = header ? header.offsetHeight : 0;

      const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
      const scrollTo = Math.max(0, elementTop - headerHeight);

      window.scrollTo({
        top: scrollTo,
        behavior: "smooth",
      });
    };

    document.addEventListener("click", handleDocumentClick);

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(".service-card, .value-item, .feature");
      elements.forEach((el) => {
        const element = el as HTMLElement;
        element.style.opacity = "0";
        element.style.transform = "translateY(30px)";
        element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(element);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleDocumentClick);
      observer.disconnect();
    };
  }, [sectionsLoaded]);

  if (!isReady || !sectionsLoaded) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "white",
        }}
      />
    );
  }

  
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Header />
      <main>
        {sections.map((section) => (
          <DynamicSection key={section.id} section={section} />
        ))}
        <Footer />
      </main>
      <ChatBot />
    </Suspense>
  );
}