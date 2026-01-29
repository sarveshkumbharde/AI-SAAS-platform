import React from 'react'
import {Routes, Route, Navigate} from 'react-router-dom';
import Home from './pages/Home';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import WriteArticle from './pages/WriteArticle';
import BlogTitles from './pages/BlogTitles';
import GenerateImages from './pages/GenerateImages';
import RemoveBackground from './pages/RemoveBackground';
import RemoveObject from './pages/RemoveObject';
import ReviewResume from './pages/ReviewResume';
import Community from './pages/Community';
import Plan from './pages/Plan';
import { useAuth } from "./context/AuthContext";
import OAuthSuccess from './pages/OAuthSuccess';
import {Toaster} from 'react-hot-toast';
import PaymentSuccess from './pages/PaymentSuccess';

const App = () => {
  const { user, loading } = useAuth();

  return (
    <div>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* 🔐 Protected AI routes */}
        <Route
          path="/ai"
          element={
            loading ? (
              null
            ) : user ? (
              <Layout />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="write-article" element={<WriteArticle />} />
          <Route path="blog-titles" element={<BlogTitles />} />
          <Route path="generate-images" element={<GenerateImages />} />
          <Route path="remove-background" element={<RemoveBackground />} />
          <Route path="remove-object" element={<RemoveObject />} />
          <Route path="review-resume" element={<ReviewResume />} />
          <Route path="community" element={<Community />} />
          <Route path="plan" element={<Plan />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App
