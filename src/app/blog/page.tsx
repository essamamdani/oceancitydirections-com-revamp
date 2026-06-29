import React from "react";
import PageBanner from "@/components/Common/PageBanner";
import BlogPostGrid3 from "@/components/Blog/BlogPostGrid3";
import { getBlogPosts } from "@/lib/actions";
import { fetchSiteData, getSiteStatus } from "@/lib/site-config";
import Navbar from "@/components/Layouts/Navbar";
import { redirect } from 'next/navigation';


export default async function Page(props) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1', 10);
    const site = await fetchSiteData();
    const siteStatus = getSiteStatus(site);
    if (siteStatus === 'parked') redirect('/parked');
    if (siteStatus === 'offline') redirect('/offline');
    
	const postsData = await getBlogPosts(site, page, 10);
	
	return (
		<>
		<Navbar />
			<PageBanner pageTitle="Blog" pageName="Blog" parentPage={undefined} parentUrl={undefined} />

			<BlogPostGrid3 posts={postsData.posts} currentPage={page} totalPages={postsData.totalPages} />
		</>
	);
}
