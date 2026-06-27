import Link from "next/link";
import { fetchSiteData } from '@/lib/site-config';
import { getSiteName } from "@/lib/helper";

export async function generateMetadata() {
  let site;
  try {
    site = await fetchSiteData();
  } catch (error) {}
  const siteName = site ? getSiteName(site) : 'Realty Directions';
  return {
    title: `Terms of Service - ${siteName}`,
    description: `Terms of Service Agreement for ${siteName}.`,
    openGraph: {
      title: `Terms of Service - ${siteName}`,
      description: `Terms of Service Agreement for ${siteName}.`,
      siteName,
    },
  };
}

export default async function Page() {
  return (
    <div className="text-content" style={{ maxWidth: 860, margin: '0 auto', padding: '60px 20px' }}>
      <h2>Terms and Conditions</h2>
      <h3>Realty Directions Terms of Service Agreement</h3>
      <p><strong>Last Updated: May 16th, 2026</strong></p>

      <p>Hello. Please read the following terms and conditions of service carefully.</p>

      <p>This Agreement governs your use of Realty Directions and all business marketing, applications, online video hosting and sharing services provided to you by Realty Directions Inc. through Realty Directions &ldquo;the Sites&rdquo; including the services accessed through the Sites (collectively, the &ldquo;Services&rdquo;). This Realty Directions Terms of Service Agreement (the &ldquo;Agreement&rdquo; or &ldquo;Terms of Service&rdquo;) is made between Realty Directions Inc. (&ldquo;Realty Directions,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) and you (&ldquo;you&rdquo; or the &ldquo;User,&rdquo; &ldquo;Users&rdquo;.)</p>

      <p>By accessing or using any of the Services, You and any persons that you authorize to use your account agree to the terms of use stated in this Agreement. This includes all Users including casual visitors to the Sites, including our network of local city Sites and registered accounts on the Sites, including our network of local city Sites that access the Services. If any in-congruencies arise between Terms in this Agreement and information included in off-line promotional materials, the Terms of this Agreement will always supersede as the single governance.</p>

      <p>Realty Directions reserves the right to amend any Terms in which you have agreed to from time to time without notice. Your continued use of the Sites, including our network of local city Sites constitutes acceptance of any amendments, additions, or modifications to this Agreement.</p>

      <p>By agreeing to use the sites, including our network of local city sites, you agree and understand the sites, including our network of local city sites is in a trial phase. Realty Directions reserves right to amend the Sites, including our network of local city Sites, including service offerings and prices at any time, for any reason, and without notice, and the right to terminate the Sites, including our network of local city Sites or any part of the Sites, including our network of local city Sites.</p>

      <p>You agree to review the posting of this Agreement at <Link href="https://www.realtydirections.com">www.RealtyDirections.com</Link> periodically to be aware of such changes. Your continued use of the Sites, including our network of local city Sites constitutes acceptance of any amendments, additions, or modifications to this Agreement. You will be bound by all such modifications, whether or not you have notice thereof. If you have created an account during our trial period we most likely will not notify you of ongoing changes and improvements to the sites, including our network of local city sites. We do reserve the right to notify you of any material changes to these Terms by email sent to the address you have provided to Realty Directions for your account. If you continue to use the Service once you have been notified of the changes to these Terms, you will be deemed to have accepted those changes.</p>

      <p>This agreement shall be governed by and construed in accordance with the internal laws of the State of Maryland U.S.A., without reference to any conflicts of law provisions.</p>

      <p>This Agreement is effective upon your clicking the &ldquo;I Agree&rdquo; button, or other button expressing your agreement to the terms herein, and shall continue until terminated.</p>

      <p>Realty Directions is currently in a trial and experimental period. During this period all User accounts are trial accounts. Realty Directions grants you a non-exclusive and non-transferable personal license to use the Sites, including our network of local city Sites which is limited and revocable. This license covers the viewing, creation and storage of media, marketing and advertising presentations. The tools and/or services you use to generate business using the Sites, including our network of local city Sites are pursuant to the Terms of this Agreement.</p>

      <p>You may not sublicense your use of the Sites, including our network of local city Sites or make your account, or parts of the personal license granted to you available to other individuals or entities that Realty Directions has not specifically authorized to receive access to your account on the Sites, including our network of local city Sites.</p>

      <p>Realty Directions fully retains all ownership rights of all services and software of the Sites, including our network of local city Sites. This includes all trademarks, copyrights, proprietary rights, trade secrets and general know-how contained in the Sites, including our network of local city Sites. You may not modify, reveal or change any source code of the Sites, including our network of local city Sites. You may not change the Sites, including our network of local city Sites, reproduce or control any of the programming code or modify, remove or obfuscate any trademark or copyright displayed within the Sites, including our network of local city Sites or any aspect or part of the Sites, including our network of local city Sites. This license allows you to use the Sites, including our network of local city Sites only with these Terms active and in effect and you have no rights to use the sites, including our network of local city sites or any part of the Sites, including our network of local city Sites if this Agreement has expired, terminated or dissolved for any reason.</p>

      <h3>Acceptable Use Standards and Content Restrictions</h3>

      <p>You may not submit any content that:</p>
      <ul>
        <li>Infringes any third party&apos;s copyrights or other rights (e.g., trademark, privacy rights, etc.);</li>
        <li>Is sexually explicit (e.g., pornography) or proposes a transaction of a sexual nature;</li>
        <li>Is hateful, defamatory, or discriminatory or incites hatred against any individual or group;</li>
        <li>Promotes or supports terror or hate groups;</li>
        <li>Exploits minors;</li>
        <li>Depicts unlawful acts or extreme violence;</li>
        <li>Provides instructions on how to assemble explosive/incendiary devices or homemade/improvised firearms;</li>
        <li>Depicts animal cruelty or extreme violence towards animals;</li>
        <li>Promotes fraudulent or dubious business schemes or proposes an unlawful transaction;</li>
        <li>Makes false or misleading claims about vaccination safety;</li>
        <li>Claims that mass tragedies are hoaxes or false flag operations;</li>
        <li>Depicts or encourages self-harm; or</li>
        <li>Violates any applicable law.</li>
      </ul>

      <p><strong>YOU MAY NOT SUBMIT ANY MATERIAL FROM AN ANONYMOUS OR FALSE ADDRESS.</strong></p>

      <p>While Realty Directions does not and cannot review all material on the Sites, including our network of local city Sites, and is not responsible for its content, Realty Directions reserves the right to remove, delete, move or edit Content that it, in its sole discretion, deems abusive, defamatory, obscene, in violation of the law, including but not limited to copyright or trademark law, or otherwise unacceptable. Realty Directions will not be liable for the Content of any submission. You agree to indemnify and hold Realty Directions harmless for any violation of this provision.</p>

      <p>In using our Services, you may not:</p>
      <ul>
        <li>Use an offensive screen name (e.g., explicit language) or avatar (e.g., containing nudity);</li>
        <li>Act in a deceptive manner or impersonate any person or organization;</li>
        <li>Harass or stalk any person;</li>
        <li>Harm or exploit minors;</li>
        <li>Distribute &ldquo;spam&rdquo; in any form or use misleading metadata;</li>
        <li>Collect personal information about others;</li>
        <li>Access another&apos;s account without permission;</li>
        <li>Engage in any unlawful activity;</li>
        <li>Embed our video player on or provide links to sites that contain content prohibited by these Terms; or</li>
        <li>Cause or encourage others to do any of the above.</li>
      </ul>

      <p><strong>Prohibited Technical Measures.</strong> You will not:</p>
      <ul>
        <li>Except as authorized by law or as permitted by us: scrape, reproduce, redistribute, create derivative works from, decompile, reverse engineer, alter, archive, or disassemble any part of our Services; or attempt to circumvent any of our security, rate-limiting, filtering, or digital rights management measures;</li>
        <li>Submit any malicious program, script, or code;</li>
        <li>Submit an unreasonable number of requests to our servers; or</li>
        <li>Take any other actions to manipulate, interfere with, or damage our Services.</li>
      </ul>

      <p><strong>Restricted Users.</strong> You may not create an account if you are a member of a terror or hate group or reside in a country subject to a comprehensive U.S. sanctions. Branding, product and service names used in the Services which identify Realty Directions and Realty Directions.com are proprietary marks of Realty Directions.com Inc.</p>

      <p>You may only upload content that you have the right to upload and share. Copyright owners may contact Realty Directions if they believe Realty Directions is hosting infringing materials. We will, in appropriate circumstances, terminate the accounts of persons who repeatedly infringe. Realty Directions is the owner of all copyright and database rights in the Services and its contents. You may not publish, distribute, extract, reuse or reproduce any such content in any material form (including photocopying or storing it in any medium by electronic means) other than in accordance with these Terms.</p>

      <p>Realty Directions hereby notifies you that all the information, content, image files, software and materials on the Sites, including our network of local city Sites may be protected by U.S. and international copyright and other intellectual property laws and by other applicable laws, including privacy laws. Realty Directions is unable to provide you with permission to copy display or distribute material for which you do not own the copyright or other intellectual property rights. You may not copy or distribute such material without the written consent of the owner, and you are solely responsible for any copyright or other intellectual property law violations that you may incur as a result of your activities on the Sites, including our network of local city Sites. Realty Directions has the absolute right to terminate your account or exclude you from the Sites, including our network of local city Sites if you use our Service to violate the intellectual property rights or other rights of third parties. In addition, you warrant that all moral rights in any Content have been waived. You agree to indemnify and hold Realty Directions harmless for any violation of this provision.</p>

      <p>If you believe the copyright in your work has been violated through the use of this Sites or the Services, please contact Realty Directions. You must provide Realty Directions with the following information: Identification of the material on the Sites, including our network of local city Sites that you believe is infringing of your work so that we may locate it on the Sites, including our network of local city Sites. Provide your address, telephone number, and email address, along with a signed statement that the information you have provided to us is accurate and you are the owner of the copyright interest involved (or you are authorized to act on behalf of that owner).</p>

      <p>We may allow you to upload, live stream, submit, or publish (collectively, to &ldquo;submit&rdquo;) content such as videos, recordings, images, and text (collectively, &ldquo;content&rdquo;). You must ensure that your content, and your conduct, complies with the Acceptable Use Standards set forth above. Realty Directions may (but is not obligated to) monitor your account, content, and conduct, regardless of your privacy settings. Realty Directions may take all appropriate actions to enforce its rights including removing specific videos or suspending or removing your account.</p>

      <p>In consideration of your use of the Services, you represent and certify that you are of legal age to form a binding contract and are not a person barred from receiving services under the laws of the United States or other applicable jurisdictions. You also agree to provide true, accurate and current information about yourself as prompted by the registration form on the Sites, including our network of local city Sites. If you provide any information that is untrue, inaccurate, not current or incomplete, or Realty Directions has reasonable grounds to suspect that such information is untrue, inaccurate, not current or incomplete, Realty Directions has the right to suspend or terminate your account and refuse any and all current or future use of the Sites, including our network of local city Sites (or any portion thereof).</p>

      <p><strong>TO PURCHASE FROM OR REGISTER AS A MEMBER OF THE SITE YOU MUST BE 18 YEARS OR OVER.</strong></p>

      <h3>Licenses Granted by You</h3>

      <p>As between you and Realty Directions, you own and will retain ownership of all intellectual property rights in and to the content you submit. In order to allow Realty Directions to host and stream your content, you grant Realty Directions the permissions set forth below.</p>

      <p><strong>Your Video Content.</strong> By submitting a video, you grant Realty Directions permission to:</p>
      <ul>
        <li>Stream the video to end users;</li>
        <li>Embed the video on third-party websites;</li>
        <li>Distribute the video via our APIs;</li>
        <li>Make the video available for download;</li>
        <li>Transcode the video (create compressed versions of your video file that are optimized for streaming); and</li>
        <li>Generate stills (i.e., &ldquo;thumbnails&rdquo;) from your video to represent it.</li>
      </ul>

      <p>The license period begins when you register with the Sites, including our network of local city Sites and ends when you or Realty Directions deletes your account; provided that Realty Directions may retain archival copies: (a) for a limited period of time in case you wish to restore it; (b) when the video is the subject of a takedown notice or other legal claim; or (c) when Realty Directions in good faith believes that it is legally obligated to do so.</p>

      <p>You grant Realty Directions permission to use your name, likeness, biography, trademarks, logos, or other identifiers used by you in your account profile for the purpose of displaying such properties to the public or the audiences you have specified. You may revoke the foregoing permission by deleting your account. Realty Directions shall have the right to identify public profiles in its marketing and investor materials.</p>

      <p>You grant Realty Directions a perpetual and irrevocable right and license to copy, transmit, distribute, publicly perform, and display Text Content (you submit in comments), through online means in connection with the Sites, including our network of local city Sites and any additional services we may offer, or offer in the future. If you make suggestions to Realty Directions on improving our products or services, Realty Directions may use your suggestions without any compensation to you.</p>

      <p>All licenses granted by you are non-exclusive, worldwide, and royalty-free and include the right and license to copy, use, distribute, publicly perform, and display the licensed work for the purposes stated above; and include all necessary rights and licenses to allow us to exercise our rights and perform our obligations.</p>

      <p>Realty Directions reserves the right to suspend or terminate your account and use of the Sites, including our network of local city Sites and remove and discard any Content including, but not limited to, any and all information, communications, postings, albums, image files or any other materials on the Sites, including our network of local city Sites, at any time, without notice, for any reason.</p>

      <p>Your account and use of the Sites, including our network of local city Sites may be removed by Realty Directions as we reserve the right to suspend or terminate your account and use of the Sites, including our network of local city Sites at anytime. This includes all materials you may have submitted or added to your account in the Sites, including our network of local city Sites. We may remove any and all information, postings communications, images, videos, without notice, for any reason both during and after our trial period and continuing into the future indefinitely.</p>

      <p>Further, you agree that Realty Directions shall not be liable to you or any third party for any termination of your access to the Sites, including our network of local city Sites. Realty Directions reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Sites, including our network of local city Sites (or any part thereof) with or without notice. You agree that Realty Directions shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Sites, including our network of local city Sites or any part of the Sites, including our network of local city Sites or additional service.</p>

      <p>Reasonable efforts are used by Realty Directions that the Sites, including our network of local city Sites is available 24 hours a day 7 days a week. There will be instances when the Sites, including our network of local city Sites is interrupted for maintenance, upgrades and emergency repairs or due to failure of telecommunications links and equipment that are beyond the control of Realty Directions. You agree that Realty Directions shall not be liable to you for any modification, suspension or discontinuance of the Sites, including our network of local city Sites.</p>

      <p>Realty Directions reserves the complete right to all URL phrases and or structures, including all vanity or personal names used in association with any URL phrases and or structures on the Sites, including our network of local city Sites. This means if a URL phrase and or structure is created by any User within the Sites, including our network of local city Sites, Realty Directions reserves the right to remove all or any portion of that URL phrase and or structure without warning or compensation of any kind, if deemed the URL phrase and or structure is at odds with the business practices of Realty Directions. Realty Directions at its sole discretion determines if any URL phrases and or structures within the Sites, including our network of local city Sites is at odds with the business practices of Realty Directions.</p>

      <h3>Disclaimer of Warranties and Limitation of Liability</h3>

      <p>THE SITE IS LICENSED &ldquo;AS IS&rdquo; AND YOU RECEIVE NO ADDITIONAL EXPRESS OR IMPLIED WARRANTIES. Realty Directions EXPRESSLY DISCLAIM ANY AND ALL OTHER WARRANTIES OF ANY KIND OR NATURE CONCERNING THE SITE, WHETHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING WITHOUT LIMITATION, ANY WARRANTY OF TITLE, MERCHANTABILITY, QUALITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, NON-INFRINGEMENT OR THE RESULTS TO BE OBTAINED FROM USE, TO THE FULLEST EXTENT ALLOWED BY APPLICABLE LAW. Realty Directions EXPRESSLY DISCLAIMS ANY WARRANTIES THAT MAY BE IMPLIED FROM USAGE OF TRADE, COURSE OF DEALING, OR COURSE OF PERFORMANCE. FURTHER, WITHOUT LIMITING THE GENERALITY OF THE FOREGOING, Realty Directions MAKES NO WARRANTIES OR REPRESENTATIONS AS TO PERFORMANCE OF THE SITE, AND SPECIFICALLY DISCLAIMS ANY WARRANTY THAT (1) THE SITE WILL OPERATE IN COMBINATION WITH OTHER ITEMS, EQUIPMENT, SOFTWARE, SYSTEMS OR DATA EXCEPT, (2) THE OPERATION OF THE SITE WILL BE UNINTERRUPTED OR ERROR FREE, OR (3) ERRORS IN THE SITE, IF ANY, WILL BE CORRECTED. NO ORAL OR WRITTEN INFORMATION OR ADVICE GIVEN BY Realty Directions, OR ITS AGENTS OR EMPLOYEES SHALL CREATE OR FORM THE BASIS OF ANY WARRANTY OF ANY KIND. THE SITE IS PROVIDED WITH ALL FAULTS AND THE ENTIRE RISK OF SATISFACTORY QUALITY, PERFORMANCE, ACCURACY, AND EFFORT IS WITH YOU.</p>

      <p>IN NO EVENT SHALL Realty Directions, ITS AFFILIATES, SUPPLIERS OR THIRD PARTY LICENSORS, OR THEIR RESPECTIVE MEMBERS, OFFICERS, DIRECTORS, SHAREHOLDERS, AGENT, EMPLOYEES, REPRESENTATIVES, SUCCESSORS AND ASSIGNS BE LIABLE FOR INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES OR PENALTIES (INCLUDING DAMAGES FOR LOST PROFITS, LOST BUSINESS, LOST DATA, BUSINESS INTERRUPTION, AND THE LIKE), HOWEVER IT ARISES, INCLUDING, BUT NOT LIMITED TO, THE USE BY YOU OF THE SITE, WHETHER FOR BREACH OF CONTRACT OR IN TORT, EVEN IF Realty Directions HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>

      <p>NOTWITHSTANDING ANY TERM OR PROVISION TO THE CONTRARY IN THIS AGREEMENT, IN NO EVENT SHALL Realty Directions&apos;s MONETARY LIABILITY IN CONNECTION WITH THIS AGREEMENT OR THE SOFTWARE, TO YOU EXCEED $100.00.</p>

      <h3>Links to Third-Party Websites</h3>

      <p>Any links to third party web sites are provided as a convenience and for informational purposes only; they do not constitute an endorsement or an approval by Realty Directions of any of the products, services or opinions of the corporation or organization or individual. Realty Directions bears no responsibility for the accuracy, legality or content of the external sites or for that of subsequent links. Contact the external sites for answers to questions regarding its content. By accessing these linked web sites you do so at your own risk. Realty Directions is not liable for any loss or damage that you may suffer by using other web sites.</p>

      <h3>General</h3>

      <p>This Agreement and the other documents delivered pursuant hereto at the Closing constitute the full and entire understanding and agreement between the parties with regard to the subjects hereof and thereof, and no party shall be liable or bound to any other party in any manner by any warranties, representations or covenants except as specifically set forth herein or therein. Except as expressly provided herein, neither this Agreement nor any term hereof may be amended, waived, discharged or terminated other than by a written instrument signed by the party against whom enforcement of any such amendment, waiver, discharge or termination is sought. The non-prevailing party in any dispute under this agreement shall pay all costs and expenses, including expert witness fees and attorneys&apos; fees, incurred by the prevailing party in resolving such dispute.</p>

      <p>If any legal action is brought to enforce this Agreement, the prevailing party will be entitled to receive its attorneys&apos; fees, court costs, and other collection expenses, in addition to any other relief it may receive. If either party is prevented from performing any of its obligations hereunder due to any cause which is beyond the non-performing party&apos;s reasonable control, including fire, explosion, flood, or other acts of God; acts, regulations, or laws of any government; war or civil commotion; strike, lock-out or labor disturbances; or failure of public utilities or common carriers (a &ldquo;Force Majeure Event&rdquo;), such non-performing party shall not be liable for breach of this Agreement with respect to such non-performance to the extent any such non-performance is due to a Force Majeure Event.</p>

      <p>The failure of Realty Directions to enforce any right or provision in this Agreement will not constitute a waiver of such right or provision unless acknowledged and agreed to by Realty Directions in writing.</p>

      <h3>Fair Housing</h3>

      <p>All Content provided on Sites is deemed reliable but is not guaranteed and should be independently verified. All real estate or local business advertising placed by anyone through the Sites, including our network of local city Sites is subject to the U.S. Federal Fair Housing Act of 1968 as amended which makes it illegal to advertise &ldquo;any preference, limitation or discrimination based on race, color, religion, sex, handicap, family status or national origin or an attention to make any such preference, limitation or discrimination.&rdquo; Local and foreign laws add prohibitions against discrimination based on age, parental status, sexual orientation, political ideology, financial status, and perhaps other basis. Please check with your local government agency for more information. Realty Directions will not knowingly accept any advertisement which is in violation of the law. Users are hereby informed that, to Realty Directions&apos;s knowledge, all dwellings, under the jurisdiction of U.S. Federal regulations advertised in this service are available on an equal opportunity basis.</p>

      <p><em>Last Updated: May 16th, 2026</em></p>
    </div>
  );
}
