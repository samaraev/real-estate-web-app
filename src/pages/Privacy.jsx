import { motion } from "framer-motion";

export default function Privacy() {
  const sections = [
    {
      title: "A legal disclaimer",
      text: "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of a Privacy Policy. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific privacy policies you wish to establish between your business and your customers and visitors. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Privacy Policy.",
    },
    {
      title: "Privacy Policy - the basics",
      text: "Having said that, a privacy policy is a statement that discloses some or all of the ways a website collects, uses, discloses, processes, and manages the data of its visitors and customers. It usually also includes a statement regarding the website's commitment to protecting its visitors' or customers' privacy, and an explanation about the different mechanisms the website is implementing in order to protect privacy.\n\nDifferent jurisdictions have different legal obligations of what must be included in a Privacy Policy. You are responsible to make sure you are following the relevant legislation to your activities and location.",
    },
    {
      title: "What to include in the Privacy Policy",
      text: "Generally speaking, a Privacy Policy often addresses these types of issues: the types of information the website is collecting and the manner in which it collects the data; an explanation about why is the website collecting these types of information; what are the website's practices on sharing the information with third parties; ways in which your visitors and customers can exercise their rights according to the relevant privacy legislation; the specific practices regarding minors' data collection; and much, much more.",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="pt-40 pb-24 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[760px]"
        >
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">Legal</p>
          <h1 className="font-display text-display-lg font-light mb-16">
            Privacy Policy
          </h1>

          <div className="space-y-14">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="hairline mb-8" />
                <h2 className="font-display text-display-sm font-light mb-4">{section.title}</h2>
                {section.text.split("\n\n").map((para, j) => (
                  <p key={j} className="font-body text-sm text-muted-foreground leading-relaxed mb-4 last:mb-0">
                    {para}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}