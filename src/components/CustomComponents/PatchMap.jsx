import dynamic from "next/dynamic";

const Map = dynamic(
  () => import('@/components/CustomComponents/Map'),
  {
    loading: () => <div className="flex justify-center font-sans text-2xl items-center font-bold h-[100vh]"><p>Loading...</p></div>,
    ssr: false
  }
);

export default function Page({ geoJson }) {
  if (geoJson?.features?.length === 0) {
    return null;
  }
  return <Map geoJson={geoJson} />;
}