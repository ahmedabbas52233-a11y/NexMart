import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#DEE2E7]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#0D6EFD] rounded flex items-center justify-center text-white font-bold">
                N
              </div>
              <span className="text-[#8CB7F5] font-bold text-xl">Brand</span>
            </div>
            <p className="text-[#505050] text-sm leading-relaxed mb-4">
              Best information about the company goes here but now lorem ipsum is placeholder text.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 bg-[#BDC4CD] rounded-full flex items-center justify-center text-white hover:bg-[#0D6EFD] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {[
            {
              title: "About",
              links: ["About Us", "Find store", "Categories", "Blogs"],
            },
            {
              title: "Partnership",
              links: ["About Us", "Find store", "Categories", "Blogs"],
            },
            {
              title: "Information",
              links: ["Help Center", "Money Refund", "Shipping", "Contact us"],
            },
            {
              title: "For users",
              links: ["Login", "Register", "Settings", "My Orders"],
            },
          ].map((column) => (
            <div key={column.title}>
              <h3 className="text-[#1C1C1C] font-medium mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-[#8B96A5] text-sm hover:text-[#0D6EFD] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Get App Column */}
          <div>
            <h3 className="text-[#1C1C1C] font-medium mb-4">Get app</h3>
            <div className="space-y-2">
              <div className="bg-[#1C1C1C] rounded-md p-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded" />
                <div className="text-white text-xs">
                  <div>Get it on</div>
                  <div className="font-medium">Google Play</div>
                </div>
              </div>
              <div className="bg-[#1C1C1C] rounded-md p-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded" />
                <div className="text-white text-xs">
                  <div>Download on</div>
                  <div className="font-medium">App Store</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#DEE2E7] bg-[#EFF2F4]">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#606060] text-sm">© 2023 Ecommerce.</p>
          <div className="flex items-center gap-2">
            <span className="w-5 h-3 bg-[#1C1C1C] rounded-sm inline-block" />
            <span className="text-[#606060] text-sm">English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}