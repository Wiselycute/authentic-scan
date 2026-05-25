import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Pill,
  Smartphone,
  Shirt,
  Baby,
  Coffee,
  Headphones,
} from "lucide-react";

export function ProductCategories() {
  const categories = [
    {
      icon: Sparkles,
      title: "Cosmetics",
      description:
        "Verify makeup, skincare, and beauty products",
      gradient: "bg-rose-500",
      bgGlow: "from-pink-500/20 to-rose-500/20",
      image: "/c1.jpg",
    },
    {
      icon: Pill,
      title: "Medicines",
      description:
        "Authenticate pharmaceutical products",
      gradient: "bg-cyan-500",
      bgGlow: "from-blue-500/20 to-cyan-500/20",
      image: "/c2.jpg",
    },
    {
      icon: Smartphone,
      title: "Electronics",
      description:
        "Verify smartphones, tablets, and gadgets",
      gradient: "bg-blue-500",
      bgGlow: "from-cyan-500/20 to-blue-500/20",
      image: "/C3.jpg",
    },
    {
      icon: Shirt,
      title: "Fashion",
      description:
        "Authenticate designer clothing and accessories",
      gradient: "bg-teal-500",
      bgGlow: "from-cyan-500/20 to-teal-500/20",
      image: "/C4.jpg",
    },
    {
      icon: Baby,
      title: "Baby Products",
      description:
        "Verify infant care and nutrition products",
      gradient: "bg-amber-500",
      bgGlow: "from-orange-500/20 to-amber-500/20",
      image: "/CS.jpg",
    },
    {
      icon: Coffee,
      title: "Food Products",
      description:
        "Authenticate packaged food and beverages",
      gradient: "bg-emerald-500",
      bgGlow: "from-green-500/20 to-emerald-500/20",
      image: "/C5.jpg",
    },
    {
      icon: Headphones,
      title: "Accessories",
      description:
        "Verify watches, jewelry, and tech accessories",
      gradient: "bg-sky-400",
      bgGlow: "from-cyan-500/20 to-blue-500/20",
      image: "/C6.jpg",
    },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm mb-6">
            <span className="text-sm text-white/80">
              Wide Coverage
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Supported Product{" "}
            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Comprehensive verification across industries
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div
                  className={`absolute -inset-2 bg-linear-to-r ${category.bgGlow} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}
                />

                <div className="relative h-72 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-transparent" />

                  <div
                    className={`absolute top-5 left-5 w-12 h-12 bg-linear-to-r ${category.gradient} rounded-xl flex items-center justify-center border border-white/25 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white">
                      {category.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/75 leading-relaxed">
                      {category.description}
                    </p>
                    <div className={`h-1 w-20 rounded-full bg-linear-to-r ${category.gradient} mt-4`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 relative">
          <div className="absolute -inset-4 bg-linear-to-r from-blue-500/20 via-cyan-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />

          <div className="relative bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Don't see your product category?
            </h3>

            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              We're constantly expanding our database.
              Request a new category or contact our team
              for custom solutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25">
                Request Category
              </button>

              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold transition-all backdrop-blur-sm">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}