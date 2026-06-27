"use client";

import React from "react";
import Image from "next/image";

const ChatContent = () => {
  return (
    <>
      <div className="chat-content-area">
        <div className="sidebar-left">
          <div className="sidebar">
            <div className="chat-sidebar-header d-flex align-items-center">
              <div className="avatar me-2">
                <Image
                  src="/images/user1.jpg"
                  width={50}
                  height={50}
                  className="rounded-circle"
                  alt="image"
                />
              </div>

              <form className="form-group position-relative mb-0">
                <label>
                  <i className="bx bx-search"></i>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search here..."
                />
              </form>
            </div>

            <div className="sidebar-content d-flex chat-sidebar">
              <div className="chat-menu">
                <label className="d-block list-group-label mt-0">Chats</label>

                <ul className="list-group list-group-user list-unstyled mb-0">
                  <li>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <Image
                          src="/images/user2.jpg"
                          width={50}
                          height={50}
                          className="rounded-circle"
                          alt="image"
                        />
                        <span className="status-busy"></span>
                      </div>

                      <div className="user-name">
                        <h6>Ellen Cranford</h6>
                        <span className="d-block">Welcome to React...</span>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <Image
                          src="/images/user3.jpg"
                          width={50}
                          height={50}
                          className="rounded-circle"
                          alt="image"
                        />
                        <span className="status-online"></span>
                      </div>

                      <div className="user-name">
                        <h6>Sherell Steckler</h6>
                        <span className="d-block">React World...</span>
                      </div>
                    </div>
                  </li>
                </ul>

                <label className="d-block list-group-label">Contacts</label>

                <ul className="list-group list-group-user list-unstyled mb-0">
                  <li>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <Image
                          src="/images/user4.jpg"
                          width={50}
                          height={50}
                          className="rounded-circle"
                          alt="image"
                        />
                        <span className="status-away"></span>
                      </div>

                      <div className="user-name">
                        <h6>Mitsue Dove</h6>
                        <span className="d-block">New Order..</span>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <Image
                          src="/images/user5.jpg"
                          width={50}
                          height={50}
                          className="rounded-circle"
                          alt="image"
                        />
                        <span className="status-offline"></span>
                      </div>

                      <div className="user-name">
                        <h6>Sasha Abele</h6>
                        <span className="d-block">Lorem Ipsum...</span>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <Image
                          src="/images/user6.jpg"
                          width={50}
                          height={50}
                          className="rounded-circle"
                          alt="image"
                        />
                        <span className="status-online"></span>
                      </div>

                      <div className="user-name">
                        <h6>Angeles Valls</h6>
                        <span className="d-block">Lorem come...</span>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <Image
                          src="/images/user7.jpg"
                          width={50}
                          height={50}
                          className="rounded-circle"
                          alt="image"
                        />
                        <span className="status-away"></span>
                      </div>

                      <div className="user-name">
                        <h6>Viki Hankins</h6>
                        <span className="d-block">Web HTML...</span>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <Image
                          src="/images/user8.jpg"
                          width={50}
                          height={50}
                          className="rounded-circle"
                          alt="image"
                        />
                        <span className="status-busy"></span>
                      </div>

                      <div className="user-name">
                        <h6>Shery Corlett</h6>
                        <span className="d-block">HTML products...</span>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <Image
                          src="/images/user9.jpg"
                          width={50}
                          height={50}
                          className="rounded-circle"
                          alt="image"
                        />
                        <span className="status-offline"></span>
                      </div>

                      <div className="user-name">
                        <h6>Jame Kolar</h6>
                        <span className="d-block">Admin template...</span>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <Image
                          src="/images/user10.jpg"
                          width={50}
                          height={50}
                          className="rounded-circle"
                          alt="image"
                        />
                        <span className="status-online"></span>
                      </div>

                      <div className="user-name">
                        <h6>Damon Alvelo</h6>
                        <span className="d-block">Web responsive...</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="content-right">
          <div className="chat-area">
            <div className="chat-list-wrapper">
              <div className="chat-list">
                <div className="chat-list-header d-flex align-items-center">
                  <div className="header-left d-flex align-items-center me-2">
                    <div className="avatar me-2 flex-shrink-0">
                      <Image
                        src="/images/user2.jpg"
                        width={50}
                        height={50}
                        className="rounded-circle"
                        alt="image"
                      />
                      <span className="status-online"></span>
                    </div>
                    <h6 className="mb-0">Ellen Cranford</h6>
                  </div>

                  <div className="header-right text-right w-100">
                    <ul className="list-unstyled mb-0">
                      <li>
                        <span className="favorite d-block">
                          <i className="bx bx-star"></i>
                        </span>
                      </li>
                      <li>
                        <div className="dropdown">
                          <button
                            className="dropdown-toggle"
                            type="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </button>
                          <div className="dropdown-menu">
                            <a
                              className="dropdown-item d-flex align-items-center"
                              href="#"
                            >
                              <i className="bx bx-pin"></i> Pin to Top
                            </a>
                            <a
                              className="dropdown-item d-flex align-items-center"
                              href="#"
                            >
                              <i className="bx bx-trash"></i> Delete Chat
                            </a>
                            <a
                              className="dropdown-item d-flex align-items-center"
                              href="#"
                            >
                              <i className="bx bx-block"></i> Block
                            </a>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="chat-container">
                  <div className="chat-content">
                    <div className="chat">
                      <div className="chat-avatar">
                        <a className="d-inline-block">
                          <Image
                            src="/images/user1.jpg"
                            width={50}
                            height={50}
                            className="rounded-circle"
                            alt="image"
                          />
                        </a>
                      </div>

                      <div className="chat-body">
                        <div className="chat-message">
                          <p>
                            👋Hi​! I am a Indice. Let me know if you have any
                            questions regarding our tool or set up a demo to
                            learn more!
                          </p>
                          <span className="time d-block">7:45 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat chat-left">
                      <div className="chat-avatar">
                        <a className="d-inline-block">
                          <Image
                            src="/images/user2.jpg"
                            width={50}
                            height={50}
                            className="rounded-circle"
                            alt="image"
                          />
                        </a>
                      </div>

                      <div className="chat-body">
                        <div className="chat-message">
                          <p>Could you describe EnvyTheme in one sentence?</p>
                          <span className="time d-block">7:45 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat">
                      <div className="chat-avatar">
                        <a className="d-inline-block">
                          <Image
                            src="/images/user1.jpg"
                            width={50}
                            height={50}
                            className="rounded-circle"
                            alt="image"
                          />
                        </a>
                      </div>

                      <div className="chat-body">
                        <div className="chat-message">
                          <p>
                            <a
                              href="https://envytheme.com/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              EnvyTheme.com
                            </a>
                          </p>
                          <span className="time d-block">7:45 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="badge badge-pill badge-light my-3">
                      Yesterday
                    </div>

                    <div className="chat chat-left">
                      <div className="chat-avatar">
                        <a className="d-inline-block">
                          <Image
                            src="/images/user2.jpg"
                            width={50}
                            height={50}
                            className="rounded-circle"
                            alt="image"
                          />
                        </a>
                      </div>

                      <div className="chat-body">
                        <div className="chat-message">
                          <p>
                            What makes you different from other learning
                            platforms?
                          </p>
                          <span className="time d-block">7:45 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat">
                      <div className="chat-avatar">
                        <a className="d-inline-block">
                          <Image
                            src="/images/user1.jpg"
                            width={50}
                            height={50}
                            className="rounded-circle"
                            alt="image"
                          />
                        </a>
                      </div>

                      <div className="chat-body">
                        <div className="chat-message">
                          <p>
                            The best Innovative Chatbot and automations are here
                            to expand.
                          </p>
                          <span className="time d-block">7:45 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat chat-left">
                      <div className="chat-avatar">
                        <a className="d-inline-block">
                          <Image
                            src="/images/user2.jpg"
                            width={50}
                            height={50}
                            className="rounded-circle"
                            alt="image"
                          />
                        </a>
                      </div>

                      <div className="chat-body">
                        <div className="chat-message">
                          <p>Great, Thank You!❤️</p>
                          <span className="time d-block">7:45 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat">
                      <div className="chat-avatar">
                        <a className="d-inline-block">
                          <Image
                            src="/images/user1.jpg"
                            width={50}
                            height={50}
                            className="rounded-circle"
                            alt="image"
                          />
                        </a>
                      </div>

                      <div className="chat-body">
                        <div className="chat-message">
                          <p>👋Hi​ I am a Indice.</p>
                          <span className="time d-block">7:45 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat chat-left">
                      <div className="chat-avatar">
                        <a className="d-inline-block">
                          <Image
                            src="/images/user2.jpg"
                            width={50}
                            height={50}
                            className="rounded-circle"
                            alt="image"
                          />
                        </a>
                      </div>

                      <div className="chat-body">
                        <div className="chat-message">
                          <p>
                            What makes you different from other learning
                            platforms?
                          </p>
                          <span className="time d-block">7:45 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="chat-list-footer">
                  <form className="d-flex align-items-center">
                    <div className="btn-box d-flex align-items-center me-2">
                      <button
                        className="emoji-btn d-inline-block me-1"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Emoji"
                        type="button"
                      >
                        <i className="bx bx-smile"></i>
                      </button>

                      <button
                        className="file-attachment-btn d-inline-block"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="File Attachment"
                        type="button"
                      >
                        <i className="bx bx-paperclip"></i>
                      </button>
                    </div>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message..."
                    />

                    <button type="submit" className="send-btn d-inline-block">
                      Send <i className="bx bx-paper-plane"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatContent;
