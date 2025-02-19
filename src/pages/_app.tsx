import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ManagedUIContext } from '@contexts/ui.context';
import ManagedModal from '@components/common/modal/managed-modal';
import ManagedDrawer from '@components/common/drawer/managed-drawer';
import React, { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { ToastContainer } from 'react-toastify';
import { ReactQueryDevtools } from 'react-query/devtools';
import { appWithTranslation } from 'next-i18next';
import { DefaultSeo } from '@components/seo/default-seo';
import { UserProvider } from '@contexts/user.context';

// external
import 'react-toastify/dist/ReactToastify.css';

// base css file
import '@assets/css/scrollbar.css';
import '@assets/css/swiper-carousel.css';
import '@assets/css/custom-plugins.css';
import '@assets/css/globals.css';
import { getDirection } from '@utils/get-direction';
import { getCurrentUser } from 'src/appwrite/Services/authServices';
import { useUI } from '@contexts/ui.context';
const Noop: React.FC = ({ children }) => <>{children}</>;

const CustomApp = ({ Component, pageProps }: AppProps) => {
  const queryClientRef = useRef<any>();
  const { authorize } = useUI();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  const router = useRouter();
  const dir = getDirection(router.locale);
  useEffect(() => {
    const initializeUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        authorize; // Update UI context to reflect the authenticated state
      }
    };

    initializeUser();
  }, [authorize]);

  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  // Cast Component and Layout as any to avoid type issues
  const Layout = (Component as any).Layout || Noop;
  const ComponentWithAny = Component as any;

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {/* Safely handle dehydratedState */}
      <Hydrate state={(pageProps as any)?.dehydratedState}>
        <UserProvider>
          <ManagedUIContext>
            <>
              <DefaultSeo />
              <Layout pageProps={pageProps}>
                {/* Cast Component as 'any' to resolve JSX type error */}
                <ComponentWithAny {...(pageProps as any)} key={router.route} />
              </Layout>
              <ToastContainer />
              <ManagedModal />
              <ManagedDrawer />
            </>
          </ManagedUIContext>
        </UserProvider>
      </Hydrate>
      {/* Uncomment for devtools */}
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider>
  );
};

export default appWithTranslation(CustomApp);
