'use client';

import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function VotacaoPublicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 