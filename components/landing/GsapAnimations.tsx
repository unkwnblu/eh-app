"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function GsapAnimations() {
  useGSAP(() => {
    // ─── 1. NAVBAR ────────────────────────────────────────────────────────────
    gsap.fromTo(
      "[data-gsap='navbar']",
      { y: -80, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }
    );

    // ─── 2. HERO — staggered entrance sequence ────────────────────────────────
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .fromTo("[data-hero='label']",   { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.3)
      .fromTo("[data-hero='heading']", { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75 }, 0.45)
      .fromTo("[data-hero='subtitle']",{ y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 }, 0.7)
      .fromTo("[data-hero='ctas']",    { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.85)
      .fromTo("[data-hero='trust']",   { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 1.0);

    // Floating cards — bounce in, then continuous float
    gsap.fromTo(
      "[data-hero='card']",
      { scale: 0.8, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.15, delay: 0.8 }
    );

    document.querySelectorAll<HTMLElement>("[data-hero='card']").forEach((card, i) => {
      gsap.to(card, {
        y: i % 2 === 0 ? -10 : 10,
        duration: 2.5 + i * 0.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.4 + i * 0.3,
      });
    });

    // ─── 3. SCROLL SECTIONS ──────────────────────────────────────────────────

    // fade-up: section headers, CTA strips
    gsap.utils.toArray<HTMLElement>("[data-gsap='fade-up']").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        }
      );
    });

    // slide-left
    gsap.utils.toArray<HTMLElement>("[data-gsap='slide-left']").forEach((el) => {
      gsap.fromTo(
        el,
        { x: -60, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });

    // slide-right
    gsap.utils.toArray<HTMLElement>("[data-gsap='slide-right']").forEach((el) => {
      gsap.fromTo(
        el,
        { x: 60, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });

    // stagger-item: group siblings under their shared parent container
    const staggerParents = new Set<Element>();
    document.querySelectorAll<HTMLElement>("[data-gsap='stagger-item']").forEach((el) => {
      if (el.parentElement) staggerParents.add(el.parentElement);
    });

    staggerParents.forEach((parent) => {
      const items = parent.querySelectorAll<HTMLElement>("[data-gsap='stagger-item']");
      gsap.fromTo(
        items,
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: parent,
            start: "top 90%",
            once: true,
          },
        }
      );
    });

    // Recalculate all trigger positions after layout settles
    ScrollTrigger.refresh();
  });

  return null;
}
