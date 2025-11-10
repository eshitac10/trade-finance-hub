import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MemberArticles from "./pages/MemberArticles";
import ArticleDetail from "./pages/ArticleDetail";
import Forum from "./pages/Forum";
import TopicDetail from "./pages/TopicDetail";
import Webinars from "./pages/Webinars";
import Events from "./pages/Events";
import SubmitDocument from "./pages/SubmitDocument";
import ChatImport from "./pages/ChatImport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/member-articles" element={<MemberArticles />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/topic/:topicId" element={<TopicDetail />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/events" element={<Events />} />
          <Route path="/submit-document" element={<SubmitDocument />} />
          <Route path="/chat-import" element={<ChatImport />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
