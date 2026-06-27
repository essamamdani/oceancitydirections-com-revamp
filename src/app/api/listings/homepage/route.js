import { NextResponse } from 'next/server';
import { fetchSiteData } from '@/lib/site-config';
import { fetchMLS } from '@/lib/actions';
import { fetchMLSStatus, convertOrder, transformRealtyCounty } from '@/lib/helper';

export async function GET() {
  const site = await fetchSiteData();

  if (!site?.IncludeRealty || !site?.ShortState || !site?.DefaultCounties?.length) {
    return NextResponse.json({ value: [] });
  }

  const defaultShortState = site.ShortState.toLowerCase();
  const countyList = site.DefaultCounties
    .map(e => `'${transformRealtyCounty(e)}-${defaultShortState}'`)
    .join(', ');

  const select = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,ListPictureURL,ListPrice,FullStreetAddress,City,PostalCode,BedroomsTotal,BathroomsFull,BathroomsHalf,AreaTotal,ListOfficeName';
  const url = `BrightProperties?$format=json&$top=6&$select=${select}&$filter=StateOrProvince eq '${defaultShortState}' and PropertyType eq 'Residential' and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 90 and ListPrice ge 400000 and County in (${countyList})&$orderby=${convertOrder('')}`;

  const data = await fetchMLS(site, url);
  return NextResponse.json(data ?? { value: [] });
}
