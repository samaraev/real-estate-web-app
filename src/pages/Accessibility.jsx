import { motion } from "framer-motion";

export default function Accessibility() {
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
          <h1 className="font-display text-display-lg font-light mb-12">
            Accessibility Statement
          </h1>

          {/* Intro note */}
          <div className="mb-16 space-y-3">
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              The purpose of the following template is to assist you in writing your accessibility statement. Please note that you are responsible for ensuring that your site's statement meets the requirements of the local law in your area or region.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              <em>*Note: This page currently has several sections. Once you complete editing the Accessibility Statement below, you need to delete this section.</em>
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              To learn more about this, check out our article "Accessibility: Adding an Accessibility Statement to Your Site".
            </p>
          </div>

          <div className="space-y-14">
            {/* Intro paragraph */}
            <div>
              <div className="hairline mb-8" />
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                This statement was last updated on [enter relevant date].
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                We at [enter organization / business name] are working to make our site [enter site name and address] accessible to people with disabilities.
              </p>
            </div>

            {/* What web accessibility is */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="hairline mb-8" />
              <h2 className="font-display text-display-sm font-light mb-4">What web accessibility is</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                An accessible site allows visitors with disabilities to browse the site with the same or a similar level of ease and enjoyment as other visitors. This can be achieved with the capabilities of the system on which the site is operating, and through assistive technologies.
              </p>
            </motion.div>

            {/* Accessibility adjustments */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="hairline mb-8" />
              <h2 className="font-display text-display-sm font-light mb-4">Accessibility adjustments on this site</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                We have adapted this site in accordance with WCAG [2.0 / 2.1 / 2.2 - select relevant option] guidelines, and have made the site accessible to the level of [A / AA / AAA - select relevant option]. This site's contents have been adapted to work with assistive technologies, such as screen readers and keyboard use. As part of this effort, we have also [remove irrelevant information]:
              </p>
              <ul className="space-y-2">
                {[
                  "Used the Accessibility Wizard to find and fix potential accessibility issues",
                  "Set the language of the site",
                  "Set the content order of the site's pages",
                  "Defined clear heading structures on all of the site's pages",
                  "Added alternative text to images",
                  "Implemented color combinations that meet the required color contrast",
                  "Reduced the use of motion on the site",
                  "Ensured all videos, audio, and files on the site are accessible",
                ].map((item, i) => (
                  <li key={i} className="font-body text-sm text-muted-foreground leading-relaxed flex gap-3">
                    <span className="text-accent mt-1">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Declaration of partial compliance */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="hairline mb-8" />
              <h2 className="font-display text-display-sm font-light mb-4">
                Declaration of partial compliance with the standard due to third-party content <span className="text-muted-foreground italic text-base">[only add if relevant]</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                The accessibility of certain pages on the site depend on contents that do not belong to the organization, and instead belong to [enter relevant third-party name]. The following pages are affected by this: [list the URLs of the pages]. We therefore declare partial compliance with the standard for these pages.
              </p>
            </motion.div>

            {/* Accessibility arrangements */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="hairline mb-8" />
              <h2 className="font-display text-display-sm font-light mb-4">
                Accessibility arrangements in the organization <span className="text-muted-foreground italic text-base">[only add if relevant]</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                [Enter a description of the accessibility arrangements in the physical offices / branches of your site's organization or business. The description can include all current accessibility arrangements - starting from the beginning of the service (e.g., the parking lot and / or public transportation stations) to the end (such as the service desk, restaurant table, classroom etc.). It is also required to specify any additional accessibility arrangements, such as disabled services and their location, and accessibility accessories (e.g. in audio inductions and elevators) available for use]
              </p>
            </motion.div>

            {/* Requests, issues and suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="hairline mb-8" />
              <h2 className="font-display text-display-sm font-light mb-4">Requests, issues and suggestions</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                If you find an accessibility issue on the site, or if you require further assistance, you are welcome to contact us through the organization's accessibility coordinator:
              </p>
              <ul className="space-y-2">
                {[
                  "[Name of the accessibility coordinator]",
                  "[Telephone number of the accessibility coordinator]",
                  "[Email address of the accessibility coordinator]",
                  "[Enter any additional contact details if relevant / available]",
                ].map((item, i) => (
                  <li key={i} className="font-body text-sm text-muted-foreground leading-relaxed flex gap-3">
                    <span className="text-accent mt-1">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}