import PageBanner from "@/components/Common/PageBanner";
import BlogDetailsContent from "@/components/BlogDetails/BlogDetailsContent";
import { getSingleBlogPost } from "@/lib/actions";
import { fetchSiteData, getSiteStatus } from "@/lib/site-config";
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Footer from "@/components/Layouts/Footer";
import NotFound from "@/components/NotFound";
import { redirect } from 'next/navigation';

export async function generateMetadata(props) {
	const params = await props.params;
	const { slug } = params;
	const site = await fetchSiteData();
	
	if (getSiteStatus(site) === 'offline' || getSiteStatus(site) === 'parked') {
		return { title: 'Site Offline' };
	}
	
	const post = await getSingleBlogPost(site, slug);
	if (!post) {
		return { title: 'Blog Post Not Found' };
	}

	const siteName = site?.site_name || 'Realty Directions';
	const excerpt = post.excerpt || post.content?.substring(0, 160) || post.title;
	
	return {
		title: `${post.title} - ${siteName}`,
		description: excerpt,
		openGraph: {
			title: post.title,
			description: excerpt,
			images: post.featured_image ? [{ url: post.featured_image }] : [],
		},
		alternates: {
			canonical: `${site?.URL || 'https://oceancitydirections.com'}/blog/${slug}`,
		},
	};
}

export default async function Page(props) {
	const params = await props.params;
	const { slug } = params;
    const site = await fetchSiteData();
    const siteStatus = getSiteStatus(site);
    if (siteStatus === 'parked') redirect('/parked');
    if (siteStatus === 'offline') redirect('/offline');
    
	const post = await getSingleBlogPost(site, slug);
	if (!post) {
		return <NotFound />;
	}
	return (
		<>
		<NavbarTwo />
			<PageBanner pageTitle={post.title} pageName={post.title} />

			<BlogDetailsContent post={post} />
			<Footer />
		</>
	);
}
