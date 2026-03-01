import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import SubmitPage from './pages/SubmitPage.jsx';
import SurpreendeMePage from './pages/SurpreendeMePage.jsx';
import SimplePage from './pages/SimplePage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ConsultingPage from './pages/ConsultingPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import SuggestionsPage from './pages/SuggestionsPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import BlogPostPage from './pages/BlogPostPage.jsx';
import ProPage from './pages/ProPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/ferramentas" element={<ToolsPage title="AQUA AI Tools" mode="all" />} />
          <Route path="/surpreende-me" element={<SurpreendeMePage />} />
          <Route path="/submeter" element={<SubmitPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/conta" element={<AccountPage />} />

          <Route path="/destaques" element={<ToolsPage title="Destaques" mode="destaques" />} />
          <Route path="/visitadas" element={<ToolsPage title="Visitadas" mode="visitadas" />} />
          <Route path="/favoritas" element={<ToolsPage title="Favoritas" mode="favoritas" />} />

          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/sugestoes" element={<SuggestionsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/pro" element={<ProPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/consultoria" element={<ConsultingPage />} />
          <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/termos" element={<TermsPage />} />

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/procurar" element={<Navigate to="/ferramentas" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
