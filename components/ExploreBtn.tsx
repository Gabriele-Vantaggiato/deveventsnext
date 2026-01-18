"use client";
import React from 'react'
import Image from "next/image";

const ExploreBtn = () => {
  return (
    <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={() => console.log('CLICKED')}>
        <a href='#events'>
            Explore Events
            <Image src="/icons/arrow-down.svg" alt="arrow-down-icon" width={22} height={22} />
        </a>
    </button>
  )
}

export default ExploreBtn