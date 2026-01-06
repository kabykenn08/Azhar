

import { Suspense, useEffect, useState } from "react";
import { useContentStore } from "../cms/contentStore";
import { supabase } from "../cms/supabaseClient";
import Header from "../components/Header";
import DynamicSection from "../components/DynamicSection";
import { loadTranslations } from "../cms/loadTranslation";

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
    const { data: homePage } = await supabase
      .from("pages")
      .select("id")
      .eq("is_home", true)
      .eq("is_active", true)
      .single();

    if (!homePage) {
      const { data: sectionsData } = await supabase
        .from("sections")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (sectionsData) {
        const sectionsWithItems = await Promise.all(
          sectionsData.map(async (section) => {
            const { data: items } = await supabase
              .from("section_items")
              .select("*")
              .eq("section_id", section.id)
              .order("order_index");

            return {
              ...section,
              items: items || [],
            };
          })
        );
        setSections(sectionsWithItems);
        setSectionsLoaded(true);
      }
      return;
    }

    const { data: pageSections } = await supabase
      .from("page_sections")
      .select("section_id, order_index")
      .eq("page_id", homePage.id)
      .eq("is_visible", true)
      .order("order_index");

    if (!pageSections || pageSections.length === 0) {
      setSectionsLoaded(true);
      return;
    }

    const sectionIds = pageSections.map((ps) => ps.section_id);
    
    const { data: sectionsData } = await supabase
      .from("sections")
      .select("*")
      .in("id", sectionIds)
      .eq("is_active", true);

    if (!sectionsData) return;

    const sectionsWithItems = await Promise.all(
      sectionsData.map(async (section) => {
        const { data: items } = await supabase
          .from("section_items")
          .select("*")
          .eq("section_id", section.id)
          .order("order_index");

        return {
          ...section,
          items: items || [],
        };
      })
    );

    const sortedSections = sectionsWithItems.sort((a, b) => {
      const orderA = pageSections.find((ps) => ps.section_id === a.id)?.order_index || 0;
      const orderB = pageSections.find((ps) => ps.section_id === b.id)?.order_index || 0;
      return orderA - orderB;
    });

    setSections(sortedSections);
    setSectionsLoaded(true);
  };

  useEffect(() => {
    if (!sectionsLoaded) return;

    const anchors = document.querySelectorAll('a[href^="#"]');
    const handleClick = (e: Event) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute("href");
      if (!href || href === "#") return;
      
      const element = document.querySelector(href);
      if (!element) return;
      
      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 0;
      const top = (element as HTMLElement).offsetTop - headerHeight;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    };

    anchors.forEach((a) => a.addEventListener("click", handleClick));

    const observerOptions = { 
      threshold: 0.1, 
      rootMargin: "0px 0px -50px 0px" 
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(".service-card, .value-item, .feature");
      elements.forEach((el) => {
        const element = el as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      anchors.forEach((a) => a.removeEventListener("click", handleClick));
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

  const mainSections = sections.filter(s => s.section_type !== 'footer');
  const footerSection = sections.find(s => s.section_type === 'footer');

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Header />
      <main>
        {mainSections.map(section => (
          <DynamicSection key={section.id} section={section} />
        ))}
      </main>
      {footerSection && <DynamicSection section={footerSection} />}
    </Suspense>
  );
}