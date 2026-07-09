import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from '@/i18n/config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathParts = pathname.split('/');
  const firstSegment = pathParts[1] as string | undefined;

  if (firstSegment && (locales as readonly string[]).includes(firstSegment)) {
    const locale = firstSegment as Locale;
    const restPath = '/' + pathParts.slice(2).join('/');

    const response = NextResponse.rewrite(new URL(restPath, request.url));
    response.headers.set('x-locale', locale);
    response.headers.set('x-next-intl-locale', locale);
    response.headers.set('x-original-pathname', pathname);
    response.headers.set('Content-Language', locale);
    response.headers.append('Vary', 'Accept-Language, Cookie');
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });

    const theme = request.cookies.get('theme')?.value;
    if (theme === 'dark' || theme === 'light') {
      response.headers.set('x-theme', theme);
    }

    return response;
  }

  let locale: Locale = defaultLocale;
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    locale = cookieLocale as Locale;
  } else {
    const acceptLanguage = request.headers.get('Accept-Language');
    if (acceptLanguage) {
      const preferred = acceptLanguage.split(',')[0]?.split('-')[0]?.trim();
      if (preferred && (locales as readonly string[]).includes(preferred)) {
        locale = preferred as Locale;
      }
    }
  }

  const redirectUrl = `/${locale}${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.redirect(new URL(redirectUrl, request.url));
  response.headers.append('Vary', 'Accept-Language, Cookie');
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: '/((?!api|_next|_vercel|favicon\\.ico|.*\\..*).*)',
};
