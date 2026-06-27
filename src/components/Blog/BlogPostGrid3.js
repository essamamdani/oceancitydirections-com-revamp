"use client";

import React from "react";
import logger from '@/lib/logger'

import Link from "next/link";
import Image from "next/image";

const BlogPostGrid3 = ({posts, currentPage, totalPages}) => {
  logger.log(posts)  
  return (
    <>
      <div className="blog-area bg-f9f9f9 ptb-100">
        <div className="container">
          <div className="row">
            {posts && posts.length > 0 ? posts.map((post, index) => <div className="col-lg-4 col-md-6" key={index}>
              <div className="single-blog-post">
                <div className="post-content">
                  <ul className="post-meta d-flex align-items-center">
                    <li>
                      <div className="d-flex align-items-center">
                        <Image
                          src="/images/logo_favicon.png"
                          alt="image"
                          width={300}
                          height={300}
                        />
                        <span>
                          <Link href="/about">Joe French</Link>
                        </span>
                      </div>
                    </li>
                    <li>
                      <i className="flaticon-calendar"></i> {post.created_at ? new Date(post.created_at).toLocaleDateString() : post.date}
                    </li>
                  </ul>
                  <h3>
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <Link href={`/blog/${post.slug}`} className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>) : (
                <div className="col-12 text-center pb-5">
                    <h3>No posts found for this site.</h3>
                </div>
            )}

            {totalPages > 1 && (
              <div className="col-lg-12 col-md-12 mt-4">
                <div className="pagination-area text-center">
                  {currentPage > 1 && (
                    <Link href={`?page=${currentPage - 1}`} className="prev page-numbers">
                      <i className="bx bx-chevrons-left"></i>
                    </Link>
                  )}
                  
                  <span className="page-numbers current" aria-current="page">
                    {currentPage}
                  </span>
                  
                  {currentPage < totalPages && (
                    <Link href={`?page=${currentPage + 1}`} className="next page-numbers">
                      <i className="bx bx-chevrons-right"></i>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPostGrid3;
