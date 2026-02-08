"use client"

import React from 'react'
import Image from 'next/image'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { LogoCarousel } from "@/shared/components/ui/logo-carousel"

// Partner Logo Components
type LogoProps = { className?: string }

function LogoImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={160}
      height={160}
      className={className}
      sizes="(min-width: 1024px) 160px, 120px"
    />
  )
}

function MaerskLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/maersk-group.jpg"
      alt="Maersk"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function MSCLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/msc.jpg"
      alt="MSC"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function CMACGMLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/cma.jpg"
      alt="CMA CGM"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function WanHaiLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/wanhai.png"
      alt="Wan Hai"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function UASCLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/UASC.png"
      alt="UASC"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function COSCOLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/cosco.png"
      alt="COSCO"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function MCCLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/mcc.jpg"
      alt="MCC"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function YangMingLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/yangming.png"
      alt="Yang Ming"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function MOLLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/mol.png"
      alt="MOL"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function NYKLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/nyk.png"
      alt="NYK"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function ZIMLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/zim.svg"
      alt="ZIM"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

function ChanMayLogo(props: LogoProps) {
  return (
    <LogoImage
      src="/icon-image/cmp.png"
      alt="Chan May"
      className={`h-24 w-auto object-contain md:h-28 ${props.className || ''}`}
    />
  )
}

const partnersLogos = [
  { name: 'Maersk', id: 1, img: MaerskLogo },
  { name: 'MSC', id: 2, img: MSCLogo },
  { name: 'CMA CGM', id: 3, img: CMACGMLogo },
  { name: 'Wan Hai', id: 4, img: WanHaiLogo },
  { name: 'UASC', id: 5, img: UASCLogo },
  { name: 'COSCO', id: 6, img: COSCOLogo },
  { name: 'MCC', id: 7, img: MCCLogo },
  { name: 'Yang Ming', id: 8, img: YangMingLogo },
  { name: 'MOL', id: 9, img: MOLLogo },
  { name: 'NYK', id: 10, img: NYKLogo },
  { name: 'ZIM', id: 11, img: ZIMLogo },
  { name: 'Chan May', id: 12, img: ChanMayLogo },
]

export function Partners() {
  const [ref, isInView] = useIntersectionObserver()

  return (
    <div ref={ref}>
      <section className="py-20 pb-[70px] bg-background">
        <div className="container">
          <div className={`section-heading ${isInView ? 'fade-rise' : 'opacity-0'}`}>
            <h2> <span className="text-primary">Global</span> Partners & Integrations</h2>
            <p>
              Trusted partnerships with leading shipping lines and logistics providers worldwide.
            </p>
          </div>

          {/* Partner Logos Carousel */}
          <div className={`relative py-12 flex justify-center ${isInView ? 'fade-rise stagger-1' : 'opacity-0'}`}>
            <LogoCarousel columnCount={4} logos={partnersLogos} />
          </div>
        </div>
      </section>
    </div>
  )
}