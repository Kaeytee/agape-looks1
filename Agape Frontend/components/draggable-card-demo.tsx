import React from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";

export default function DraggableCardDemo() {
  const items = [
    {
      title: "Brocade Pattern",
      image: "/brocade-material-red-purple.jpeg",
      className: "absolute top-10 left-[20%] rotate-[-5deg]",
    },
    {
      title: "Royal Lace",
      image: "/royal-collection-lace.jpg",
      className: "absolute top-40 left-[25%] rotate-[-7deg]",
    },
    {
      title: "Beaded Lace",
      image: "/beaded-lace-style-purple.jpeg",
      className: "absolute top-5 left-[40%] rotate-[8deg]",
    },
    {
      title: "Red Brocade",
      image: "/brocade-style-red.jpeg",
      className: "absolute top-32 left-[55%] rotate-[10deg]",
    },
    {
      title: "Blue Brocade",
      image: "/brocade-style-blue.jpeg",
      className: "absolute top-20 right-[35%] rotate-[2deg]",
    },
    {
      title: "Green Gold Beaded",
      image: "/green-gold-beaded-lace.png",
      className: "absolute top-24 left-[45%] rotate-[-7deg]",
    },
    {
      title: "Purple Beaded Lace",
      image: "/beaded-lace-material-purple.jpeg",
      className: "absolute top-8 left-[30%] rotate-[4deg]",
    },
  ];
  return (
    <DraggableCardContainer className="relative flex min-h-screen w-full items-center justify-center overflow-clip">
      <p className="absolute top-1/2 mx-auto max-w-2xl -translate-y-3/4 text-center text-2xl font-bold text-muted-foreground md:text-4xl font-display">
        Explore Our Handcrafted Fabrics
      </p>
      {items.map((item, index) => (
        <DraggableCardBody key={index} className={item.className}>
          <img
            src={item.image}
            alt={item.title}
            className="pointer-events-none relative z-10 h-80 w-80 object-cover rounded-md"
          />
          <h3 className="mt-4 text-center text-xl font-bold text-foreground">
            {item.title}
          </h3>
        </DraggableCardBody>
      ))}
    </DraggableCardContainer>
  );
}
