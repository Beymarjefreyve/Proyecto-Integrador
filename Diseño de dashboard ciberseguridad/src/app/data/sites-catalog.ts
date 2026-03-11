import { CatalogSite } from '../types';

export const sitesCatalog: CatalogSite[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://accounts.google.com',
    icon: 'https://www.google.com/favicon.ico',
    category: 'email',
    color: '#DB4437'
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/login',
    icon: 'https://github.com/favicon.ico',
    category: 'development',
    color: '#181717'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://www.facebook.com/login',
    icon: 'https://www.facebook.com/favicon.ico',
    category: 'social',
    color: '#1877F2'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    url: 'https://www.tiktok.com/login',
    icon: 'https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web/tiktok/web/node/_next/static/images/logo-7328701c910ebbcc928821a64b669420.svg', // TikTok favicon can be tricky, using a placeholder or generic URL usually works, or just domain icon
    category: 'social',
    color: '#000000'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/accounts/login/',
    icon: 'https://www.instagram.com/favicon.ico',
    category: 'social',
    color: '#E4405F'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    url: 'https://twitter.com/login',
    icon: 'https://abs.twimg.com/favicons/twitter.3.ico',
    category: 'social',
    color: '#000000'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    url: 'https://www.netflix.com/login',
    icon: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico',
    category: 'streaming',
    color: '#E50914'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    url: 'https://accounts.spotify.com/login',
    icon: 'https://www.scdn.co/i/_global/favicon.png',
    category: 'streaming',
    color: '#1DB954'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    url: 'https://www.amazon.com/ap/signin',
    icon: 'https://www.amazon.com/favicon.ico',
    category: 'shopping',
    color: '#FF9900'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/login',
    icon: 'https://www.linkedin.com/favicon.ico',
    category: 'work',
    color: '#0A66C2'
  },
  {
    id: 'discord',
    name: 'Discord',
    url: 'https://discord.com/login',
    icon: 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico',
    category: 'social',
    color: '#5865F2'
  },
  {
    id: 'slack',
    name: 'Slack',
    url: 'https://slack.com/signin',
    icon: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png',
    category: 'work',
    color: '#4A154B'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    url: 'https://www.paypal.com/signin',
    icon: 'https://www.paypalobjects.com/en_US/i/icon/pp_favicon_x.ico',
    category: 'finance',
    color: '#00457C'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    url: 'https://login.live.com',
    icon: 'https://c1.microsoft.com/favicon.ico',
    category: 'work',
    color: '#00A4EF'
  },
  {
    id: 'apple',
    name: 'Apple',
    url: 'https://appleid.apple.com/sign-in',
    icon: 'https://www.apple.com/favicon.ico',
    category: 'work',
    color: '#A2AAAD'
  }
];
