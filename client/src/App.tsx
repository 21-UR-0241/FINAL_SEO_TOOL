
// // // //client/src/App.tsx
// // import { Switch, Route, useLocation } from "wouter";
// // import { useEffect } from "react";
// // import { queryClient } from "./lib/queryClient";
// // import { QueryClientProvider } from "@tanstack/react-query";
// // import { Toaster } from "@/components/ui/toaster";
// // import { TooltipProvider } from "@/components/ui/tooltip";
// // import AdminPanel from "@/pages/AdminPanel";
// // // Page imports
// // import NotFound from "@/pages/not-found";
// // import Dashboard from "@/pages/dashboard";
// // import Websites from "@/pages/websites";
// // import AIContent from "@/pages/ai-content";
// // import StandaloneContent from "./pages/ai-content-stand-alone";
// // import SEOAnalysis from "@/pages/seo-analysis";
// // import ContentSchedule from "@/pages/content-schedule";
// // import Reports from "@/pages/reports";
// // import ActivityLogs from "@/pages/activity-logs";
// // import Settings from "@/pages/settings";
// // import ImageMetadata from "@/pages/image-metadata";
// // import GoogleSearchConsole from "@/pages/googlesearchconsole";
// // import ResetPasswordPage from "@/pages/ResetPasswordPage";
// // // Layout components
// // import Sidebar, { MobileSidebarProvider } from "@/components/layout/sidebar";
// // import Header from "@/components/layout/header";
// // // Auth components
// // import { AuthProvider, ProtectedRoute, AuthPage, useAuth } from "@/pages/authentication";
// // import HighIntentCollection from "./pages/high-intent-collection";

// // // =============================================================================
// // // PROTECTED ROUTER COMPONENT (for authenticated routes)
// // // =============================================================================
// // function ProtectedRouter() {
// //   const { user } = useAuth();
// //   return (
// //     <Switch>
// //       <Route path="/" component={Dashboard} />
// //       <Route path="/websites" component={Websites} />
      
// //       {/* Put more specific route BEFORE the general one */}
// //       <Route path="/ai-content-stand-alone" component={StandaloneContent} />
// //       <Route path="/ai-content" component={AIContent} />
// //       <Route path="/high-intent-collection" component={HighIntentCollection} />
// //       <Route path="/seo-analysis" component={SEOAnalysis} />
// //       <Route path="/googlesearchconsole" component={GoogleSearchConsole} />
// //       <Route path="/content-schedule" component={ContentSchedule} />
// //       <Route path="/image-metadata" component={ImageMetadata} />
// //       <Route path="/reports" component={Reports} />
// //       <Route path="/activity-logs" component={ActivityLogs} />
// //       <Route path="/settings" component={Settings} />
      
// //       {/* Add admin route with conditional rendering */}
// //       <Route path="/admin">
// //         {user?.isAdmin ? <AdminPanel /> : <NotFound />}
// //       </Route>
      
// //       <Route component={NotFound} />
// //     </Switch>
// //   );
// // }

// // // =============================================================================
// // // AUTHENTICATED LAYOUT
// // // =============================================================================
// // function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
// //   return (
// //     <div className="flex h-screen overflow-hidden bg-gray-50">
// //       <Sidebar />
// //       <div className="flex flex-col w-0 flex-1 overflow-hidden">
// //         <Header />
// //         <main className="flex-1 relative overflow-y-auto focus:outline-none px-4 sm:px-6 lg:px-8">
// //           <div className="py-4 sm:py-6">{children}</div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }

// // // =============================================================================
// // // REDIRECT COMPONENT
// // // =============================================================================
// // function Redirect({ to }: { to: string }) {
// //   const [, setLocation] = useLocation();
// //   useEffect(() => {
// //     setLocation(to);
// //   }, [to, setLocation]);
// //   return null;
// // }

// // // =============================================================================
// // // APP CONTENT - Handles routing based on auth state
// // // =============================================================================
// // function AppContent() {
// //   const { user, loading } = useAuth();
  
// //   // Show loading spinner while checking auth status
// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen">
// //         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
// //       </div>
// //     );
// //   }
  
// //   return (
// //     <Switch>
// //       {/* Public routes (accessible without authentication) */}
// //       <Route path="/login">
// //         {user ? <Redirect to="/" /> : <AuthPage />}
// //       </Route>
// //       <Route path="/reset-password" component={ResetPasswordPage} />
      
// //       {/* Protected routes (requires authentication) */}
// //       <Route>
// //         {user ? (
// //           <MobileSidebarProvider>
// //             <AuthenticatedLayout>
// //               <ProtectedRouter />
// //             </AuthenticatedLayout>
// //           </MobileSidebarProvider>
// //         ) : (
// //           <AuthPage />
// //         )}
// //       </Route>
// //     </Switch>
// //   );
// // }

// // // =============================================================================
// // // MAIN APP COMPONENT
// // // =============================================================================
// // function App() {
// //   return (
// //     <QueryClientProvider client={queryClient}>
// //       <TooltipProvider>
// //         <AuthProvider>
// //           <AppContent />
// //           <Toaster />
// //         </AuthProvider>
// //       </TooltipProvider>
// //     </QueryClientProvider>
// //   );
// // }

// // export default App;





// // //client/src/App.tsx
// import { Switch, Route, useLocation } from "wouter";
// import { useEffect, useState } from "react";
// import { queryClient } from "./lib/queryClient";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import AdminPanel from "@/pages/AdminPanel";
// // Page imports
// import NotFound from "@/pages/not-found";
// import Dashboard from "@/pages/dashboard";
// import Websites from "@/pages/websites";
// import AIContent from "@/pages/ai-content";
// import StandaloneContent from "./pages/ai-content-stand-alone";
// import SEOAnalysis from "@/pages/seo-analysis";
// import ContentSchedule from "@/pages/content-schedule";
// import Reports from "@/pages/reports";
// import ActivityLogs from "@/pages/activity-logs";
// import Settings from "@/pages/settings";
// import ImageMetadata from "@/pages/image-metadata";
// import GoogleSearchConsole from "@/pages/googlesearchconsole";
// import ResetPasswordPage from "@/pages/ResetPasswordPage";
// import HighIntentCollection from "./pages/high-intent-collection";
// import SubscriptionPage from "@/pages/subscription";
// import BillingPage from "@/pages/billing";
// import LandingPage from "@/pages/landing-page";

// // Layout components
// import Sidebar, { MobileSidebarProvider } from "@/components/layout/sidebar";
// import Header from "@/components/layout/header";
// // Auth components
// import { AuthProvider, ProtectedRoute, AuthPage, useAuth } from "@/pages/authentication";

// // =============================================================================
// // PROTECTED ROUTER COMPONENT (for authenticated routes)
// // =============================================================================
// function ProtectedRouter() {
//   const { user } = useAuth();
//   return (
//     <Switch>
//       <Route path="/" component={Dashboard} />
//       <Route path="/websites" component={Websites} />
      
//       {/* Put more specific route BEFORE the general one */}
//       <Route path="/ai-content-stand-alone" component={StandaloneContent} />
//       <Route path="/ai-content" component={AIContent} />
//       <Route path="/high-intent-collection" component={HighIntentCollection} />
//       <Route path="/seo-analysis" component={SEOAnalysis} />
//       <Route path="/googlesearchconsole" component={GoogleSearchConsole} />
//       <Route path="/content-schedule" component={ContentSchedule} />
//       <Route path="/image-metadata" component={ImageMetadata} />
//       <Route path="/reports" component={Reports} />
//       <Route path="/activity-logs" component={ActivityLogs} />
//       <Route path="/settings" component={Settings} />
      
//       {/* Add admin route with conditional rendering */}
//       <Route path="/admin">
//         {user?.isAdmin ? <AdminPanel /> : <NotFound />}
//       </Route>
      
//       <Route component={NotFound} />
//     </Switch>
//   );
// }

// // =============================================================================
// // AUTHENTICATED LAYOUT
// // =============================================================================
// function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen overflow-hidden bg-gray-50">
//       <Sidebar />
//       <div className="flex flex-col w-0 flex-1 overflow-hidden">
//         <Header />
//         <main className="flex-1 relative overflow-y-auto focus:outline-none px-4 sm:px-6 lg:px-8">
//           <div className="py-4 sm:py-6">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }

// // =============================================================================
// // NEW USER REDIRECT COMPONENT
// // =============================================================================
// function NewUserRedirect() {
//   const [, setLocation] = useLocation();
//   const [checking, setChecking] = useState(true);

//   useEffect(() => {
//     const checkSubscription = async () => {
//       try {
//         const response = await fetch("/api/subscription/current", {
//           credentials: "include",
//         });

//         if (response.ok) {
//           const data = await response.json();
//           // If user has a plan (even free), redirect to dashboard
//           // If no plan data or plan is null/undefined, redirect to subscription
//           if (data.plan) {
//             setLocation("/dashboard");
//           } else {
//             setLocation("/subscription");
//           }
//         } else {
//           // If API call fails, assume new user and send to subscription
//           setLocation("/subscription");
//         }
//       } catch (error) {
//         console.error("Failed to check subscription:", error);
//         // On error, default to subscription page
//         setLocation("/subscription");
//       } finally {
//         setChecking(false);
//       }
//     };

//     checkSubscription();
//   }, [setLocation]);

//   if (checking) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return null;
// }

// // =============================================================================
// // REDIRECT COMPONENT
// // =============================================================================
// function Redirect({ to }: { to: string }) {
//   const [, setLocation] = useLocation();
//   useEffect(() => {
//     setLocation(to);
//   }, [to, setLocation]);
//   return null;
// }

// // =============================================================================
// // APP CONTENT - Handles routing based on auth state
// // =============================================================================
// function AppContent() {
//   const { user, loading } = useAuth();
  
//   // Show loading spinner while checking auth status
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }
  
//   return (
//     <Switch>
//       {/* Landing page - public home */}
//       <Route path="/">
//         {user ? <NewUserRedirect /> : <LandingPage />}
//       </Route>
      
//       {/* Public routes (accessible without authentication) */}
//       <Route path="/login">
//         {user ? <Redirect to="/dashboard" /> : <AuthPage />}
//       </Route>
//       <Route path="/reset-password" component={ResetPasswordPage} />
      
//       {/* Subscription page - standalone layout (no sidebar/header) */}
//       <Route path="/subscription">
//         {user ? <SubscriptionPage /> : <AuthPage />}
//       </Route>
      
//       {/* Billing page - standalone layout (no sidebar/header) */}
//       <Route path="/billing">
//         {user ? <BillingPage /> : <AuthPage />}
//       </Route>
      
//       {/* Dashboard - redirect from root when authenticated */}
//       <Route path="/dashboard">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <Dashboard />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       {/* Protected routes (requires authentication) */}
//       <Route path="/websites">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <Websites />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/ai-content-stand-alone">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <StandaloneContent />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/ai-content">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <AIContent />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/high-intent-collection">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <HighIntentCollection />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/seo-analysis">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <SEOAnalysis />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/googlesearchconsole">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <GoogleSearchConsole />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/content-schedule">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <ContentSchedule />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/image-metadata">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <ImageMetadata />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/reports">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <Reports />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/activity-logs">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <ActivityLogs />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/settings">
//         {user ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <Settings />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       <Route path="/admin">
//         {user?.isAdmin ? (
//           <MobileSidebarProvider>
//             <AuthenticatedLayout>
//               <AdminPanel />
//             </AuthenticatedLayout>
//           </MobileSidebarProvider>
//         ) : (
//           <Redirect to="/" />
//         )}
//       </Route>
      
//       {/* 404 Not Found */}
//       <Route component={NotFound} />
//     </Switch>
//   );
// }

// // =============================================================================
// // MAIN APP COMPONENT
// // =============================================================================
// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <AuthProvider>
//           <AppContent />
//           <Toaster />
//         </AuthProvider>
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;



// //client/src/App.tsx
import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminPanel from "@/pages/AdminPanel";
// Page imports
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Websites from "@/pages/websites";
import AIContent from "@/pages/ai-content";
import StandaloneContent from "./pages/ai-content-stand-alone";
import SEOAnalysis from "@/pages/seo-analysis";
import ContentSchedule from "@/pages/content-schedule";
import Reports from "@/pages/reports";
import ActivityLogs from "@/pages/activity-logs";
import Settings from "@/pages/settings";
import ImageMetadata from "@/pages/image-metadata";
import GoogleSearchConsole from "@/pages/googlesearchconsole";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import HighIntentCollection from "./pages/high-intent-collection";
import SubscriptionPage from "@/pages/subscription";
import BillingPage from "@/pages/billing";
import LandingPage from "@/pages/landing-page";

// Layout components
import Sidebar, { MobileSidebarProvider } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
// Auth components
import { AuthProvider, ProtectedRoute, AuthPage, useAuth } from "@/pages/authentication";

// =============================================================================
// PROTECTED ROUTER COMPONENT (for authenticated routes)
// =============================================================================
function ProtectedRouter() {
  const { user } = useAuth();
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/websites" component={Websites} />
      
      {/* Put more specific route BEFORE the general one */}
      <Route path="/ai-content-stand-alone" component={StandaloneContent} />
      <Route path="/ai-content" component={AIContent} />
      <Route path="/high-intent-collection" component={HighIntentCollection} />
      <Route path="/seo-analysis" component={SEOAnalysis} />
      <Route path="/googlesearchconsole" component={GoogleSearchConsole} />
      <Route path="/content-schedule" component={ContentSchedule} />
      <Route path="/image-metadata" component={ImageMetadata} />
      <Route path="/reports" component={Reports} />
      <Route path="/activity-logs" component={ActivityLogs} />
      <Route path="/settings" component={Settings} />
      
      {/* Add admin route with conditional rendering */}
      <Route path="/admin">
        {user?.isAdmin ? <AdminPanel /> : <NotFound />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

// =============================================================================
// AUTHENTICATED LAYOUT
// =============================================================================
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// =============================================================================
// NEW USER REDIRECT COMPONENT
// =============================================================================
function NewUserRedirect() {
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/subscription/current", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // If user has a plan (even free), redirect to dashboard
          // If no plan data or plan is null/undefined, redirect to subscription
          if (data.plan) {
            setLocation("/dashboard");
          } else {
            setLocation("/subscription");
          }
        } else {
          // If API call fails, assume new user and send to subscription
          setLocation("/subscription");
        }
      } catch (error) {
        console.error("Failed to check subscription:", error);
        // On error, default to subscription page
        setLocation("/subscription");
      } finally {
        setChecking(false);
      }
    };

    checkSubscription();
  }, [setLocation]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}

// =============================================================================
// REDIRECT COMPONENT
// =============================================================================
function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
}

// =============================================================================
// APP CONTENT - Handles routing based on auth state
// =============================================================================
function AppContent() {
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <Switch>
      {/* Landing page - public home */}
      <Route path="/">
        {user ? <NewUserRedirect /> : <LandingPage />}
      </Route>
      
      {/* Public routes (accessible without authentication) */}
      <Route path="/login">
        {user ? <Redirect to="/dashboard" /> : <AuthPage />}
      </Route>
      <Route path="/reset-password" component={ResetPasswordPage} />
      
      {/* Subscription page - standalone layout (no sidebar/header) */}
      <Route path="/subscription">
        {user ? <SubscriptionPage /> : <AuthPage />}
      </Route>
      
      {/* Billing page - standalone layout (no sidebar/header) */}
      <Route path="/billing">
        {user ? <BillingPage /> : <AuthPage />}
      </Route>
      
      {/* Dashboard - redirect from root when authenticated */}
      <Route path="/dashboard">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      {/* Protected routes (requires authentication) */}
      <Route path="/websites">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <Websites />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/ai-content-stand-alone">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <StandaloneContent />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/ai-content">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <AIContent />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/high-intent-collection">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <HighIntentCollection />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/seo-analysis">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <SEOAnalysis />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/googlesearchconsole">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <GoogleSearchConsole />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/content-schedule">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <ContentSchedule />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/image-metadata">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <ImageMetadata />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/reports">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <Reports />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/activity-logs">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <ActivityLogs />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/settings">
        {user ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      <Route path="/admin">
        {user?.isAdmin ? (
          <MobileSidebarProvider>
            <AuthenticatedLayout>
              <AdminPanel />
            </AuthenticatedLayout>
          </MobileSidebarProvider>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      
      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
