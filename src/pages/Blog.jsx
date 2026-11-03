import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

import { ArrowRight } from "lucide-react";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.BlogPost.list("-created_date", 20);
      setPosts(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="pt-32 pb-24">
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-display-lg font-light mt-3 mb-12">
            Insights & <span className="italic">Analysis</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="group cursor-pointer"
                >
                {post.featured_image && (
                  <div className="aspect-[16/10] overflow-hidden mb-6">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                    />
                  </div>
                )}
                <p className="font-body text-xs tracking-label uppercase text-accent mb-3">
                  {post.category}
                  {post.read_time && ` · ${post.read_time} min read`}
                </p>
                <h3 className="font-display text-xl md:text-2xl font-light mb-3 group-hover:text-accent transition-colors">
                  {post.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 font-body text-xs tracking-label uppercase text-foreground group-hover:text-accent transition-colors">
                  Read More <ArrowRight size={12} />
                </span>
              </motion.article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}