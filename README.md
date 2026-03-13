# NCKH Project

Đây là một dự án React + TypeScript được xây dựng với Vite.

## Cộng Nghệ Sử Dụng

- React 18
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios

## Cấu Trúc Dự Án

```
src/
├── assets/       # Ảnh, font, icons, CSS...
├── components/   # Các component UI chung
│   ├── ui/      # Button, Modal, Input...
│   ├── Layout/  # Navbar, Sidebar, Footer
│   ├── hooks/   # Custom hooks
│   └── utils/   # Các hàm tiện ích
├── pages/       # Các trang (Home, About, Dashboard...)
├── store/       # Redux state (Redux slices, index)
├── routes/      # Router configuration
├── services/    # API services (authService, userService)
├── config/      # Configuration (axios, env, theme...)
├── types/       # TypeScript types
├── App.tsx      # Main component
└── main.tsx     # Entry point
```

## Cài Đặt

```bash
npm install
```

## Chạy Dự Án

```bash
npm run dev
```

## Build

```bash
npm run build
```
