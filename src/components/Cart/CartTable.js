"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const CartTable = () => {
  return (
    <>
      <div className="cart-area ptb-100">
        <div className="container">
          <form>
            <div className="cart-table table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Name</th>
                    <th scope="col">Unit Price</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="product-thumbnail">
                      <Link href="/products/details/">
                        <Image
                          src="/images/products/products-img1.jpg"
                          alt="item"
                          width={670}
                          height={800}
                        />
                      </Link>
                    </td>

                    <td className="product-name">
                      <Link href="/products/details/">Note Book Mockup</Link>
                    </td>

                    <td className="product-price">
                      <span className="unit-amount">$250.00</span>
                    </td>

                    <td className="product-quantity">
                      <div className="input-counter">
                        <span className="minus-btn">
                          <i className="bx bx-minus"></i>
                        </span>
                        <input
                          type="text"
                          min="1"
                          value="1"
                          onChange={(e) => e}
                        />
                        <span className="plus-btn">
                          <i className="bx bx-plus"></i>
                        </span>
                      </div>
                    </td>

                    <td className="product-subtotal">
                      <span className="subtotal-amount">$250.00</span>

                      <button type="submit" className="remove">
                        <i className="bx bx-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="product-thumbnail">
                      <Link href="/products/details/">
                        <Image
                          src="/images/products/products-img2.jpg"
                          alt="item"
                          width={670}
                          height={800}
                        />
                      </Link>
                    </td>

                    <td className="product-name">
                      <Link href="/products/details/">
                        Motivational Book Cover
                      </Link>
                    </td>

                    <td className="product-price">
                      <span className="unit-amount">$200.00</span>
                    </td>

                    <td className="product-quantity">
                      <div className="input-counter">
                        <span className="minus-btn">
                          <i className="bx bx-minus"></i>
                        </span>
                        <input
                          type="text"
                          min="1"
                          value="1"
                          onChange={(e) => e}
                        />
                        <span className="plus-btn">
                          <i className="bx bx-plus"></i>
                        </span>
                      </div>
                    </td>

                    <td className="product-subtotal">
                      <span className="subtotal-amount">$200.00</span>

                      <button type="submit" className="remove">
                        <i className="bx bx-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="product-thumbnail">
                      <Link href="/products/details/">
                        <Image
                          src="/images/products/products-img3.jpg"
                          alt="item"
                          width={670}
                          height={800}
                        />
                      </Link>
                    </td>

                    <td className="product-name">
                      <Link href="/products/details/">Book Cover Softcover</Link>
                    </td>

                    <td className="product-price">
                      <span className="unit-amount">$200.00</span>
                    </td>

                    <td className="product-quantity">
                      <div className="input-counter">
                        <span className="minus-btn">
                          <i className="bx bx-minus"></i>
                        </span>
                        <input
                          type="text"
                          min="1"
                          value="1"
                          onChange={(e) => e}
                        />
                        <span className="plus-btn">
                          <i className="bx bx-plus"></i>
                        </span>
                      </div>
                    </td>

                    <td className="product-subtotal">
                      <span className="subtotal-amount">$200.00</span>

                      <button type="submit" className="remove">
                        <i className="bx bx-trash"></i>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="product-thumbnail">
                      <Link href="/products/details/">
                        <Image
                          src="/images/products/products-img4.jpg"
                          alt="item"
                          width={670}
                          height={800}
                        />
                      </Link>
                    </td>

                    <td className="product-name">
                      <Link href="/products/details/">
                        Stop and Take a Second
                      </Link>
                    </td>

                    <td className="product-price">
                      <span className="unit-amount">$150.00</span>
                    </td>

                    <td className="product-quantity">
                      <div className="input-counter">
                        <span className="minus-btn">
                          <i className="bx bx-minus"></i>
                        </span>
                        <input
                          type="text"
                          min="1"
                          value="1"
                          onChange={(e) => e}
                        />
                        <span className="plus-btn">
                          <i className="bx bx-plus"></i>
                        </span>
                      </div>
                    </td>

                    <td className="product-subtotal">
                      <span className="subtotal-amount">$150.00</span>
                      <button type="submit" className="remove">
                        <i className="bx bx-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="cart-buttons">
              <div className="row align-items-center">
                <div className="col-lg-7 col-sm-7 col-md-7">
                  <div className="shopping-coupon-code">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Coupon code"
                      name="coupon-code"
                      id="coupon-code"
                    />
                    <button type="submit">Apply Coupon</button>
                  </div>
                </div>

                <div className="col-lg-5 col-sm-5 col-md-5 text-right">
                  <button type="submit" className="default-btn">
                    Update Cart
                  </button>
                </div>
              </div>
            </div>

            <div className="cart-totals">
              <h3>Cart Totals</h3>

              <ul>
                <li>
                  Subtotal <span>$800.00</span>
                </li>
                <li>
                  Shipping <span>$30.00</span>
                </li>
                <li>
                  Total <span>$830.00</span>
                </li>
              </ul>

              <Link href="/checkout" className="default-btn">
                Proceed to Checkout
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CartTable;
