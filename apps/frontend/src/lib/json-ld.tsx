type Thing = Record<string, unknown>;

export function JsonLd({ data }: { data: Thing }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function websiteJsonLd(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Know A Song',
    url,
    description: 'Discover songs from your favorite films and TV series',
    inLanguage: ['en', 'ru'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/en/films?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function movieJsonLd({
  name,
  description,
  image,
  url,
  datePublished,
  aggregateRating,
  genre,
}: {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  datePublished?: string;
  aggregateRating?: { ratingValue: number; ratingCount: number; bestRating: number };
  genre?: string[];
}) {
  const result: Thing = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name,
  };
  if (description) result.description = description;
  if (image) result.image = image;
  if (url) result.url = url;
  if (datePublished) result.datePublished = datePublished;
  if (aggregateRating) result.aggregateRating = aggregateRating;
  if (genre) result.genre = genre;
  return result;
}

export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export function tvSeriesJsonLd({
  name,
  description,
  image,
  url,
  datePublished,
  aggregateRating,
  genre,
}: {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  datePublished?: string;
  aggregateRating?: { ratingValue: number; ratingCount: number; bestRating: number };
  genre?: string[];
}) {
  const result: Thing = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name,
  };
  if (description) result.description = description;
  if (image) result.image = image;
  if (url) result.url = url;
  if (datePublished) result.datePublished = datePublished;
  if (aggregateRating) result.aggregateRating = aggregateRating;
  if (genre) result.genre = genre;
  return result;
}
