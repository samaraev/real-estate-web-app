import { motion } from "framer-motion";

export default function Terms() {
  const sections = [
    {
      title: "A legal disclaimer",
      text: "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of Terms & Conditions. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific terms you wish to establish between your business and your customers and visitors. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Terms & Conditions.",
    },
    {
      title: "Terms & Conditions - the basics",
      text: "Having said that, Terms and Conditions (\"T&C\") are a set of legally binding terms defined by you, as the owner of this website. The T&C set forth the legal boundaries governing the activities of the website visitors, or your customers, while they visit or engage with this website. The T&C are meant to establish the legal relationship between the site visitors and you as the website owner.\n\nT&C should be defined according to the specific needs and nature of each website. For example, a website offering products to customers in e-commerce transactions requires T&C that are different from the T&C of a website only providing information (like a blog, a landing page, and so on).\n\nT&C provide you as the website owner the ability to protect yourself from potential legal exposure, but this may differ from jurisdiction to jurisdiction, so make sure to receive local legal advice if you are trying to protect yourself from legal exposure.",
    },
    {
      title: "What to include in the T&C document",
      text: "Generally speaking, T&C often address these types of issues: Who is allowed to use the website; the possible payment methods; a declaration that the website owner may change his or her offering in the future; the types of warranties the website owner gives his or her customers; a reference to issues of intellectual property or copyrights, where relevant; the website owner's right to suspend or cancel a member's account; and much, much more.",
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
            Terms &amp; Conditions
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