"use client";

// Komponen yang membaca sessionStorage/localStorage hanya dirender di browser.
import dynamic from "next/dynamic";
import { LoadingScreen } from "./ui";

export const LoginForm = dynamic(() => import("./LoginForm"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export const ExamApp = dynamic(() => import("./exam/ExamApp"), {
  ssr: false,
  loading: () => <LoadingScreen label="Menyiapkan tes…" />,
});

export const ResultView = dynamic(() => import("./ResultView"), {
  ssr: false,
  loading: () => <LoadingScreen label="Memuat hasil…" />,
});
