import Image from "next/image";


import DSD from "@/components/dsd";


export default function Home() {
  return (
    <div className=""
      onContextMenu={(e) => {
        e.preventDefault()
      }}
    >
      <main className="">
        <DSD />
      </main>
    </div>
  );
}
