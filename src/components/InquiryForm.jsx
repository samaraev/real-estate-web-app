import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function InquiryForm({ propertyId, propertyTitle }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
    inquiry_type: "Tour Request",
    preferred_date: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.Inquiry.create({
      ...form,
      property_id: propertyId || "",
      status: "New",
    });
    toast({
      title: "Inquiry Sent",
      description: "We'll be in touch within 24 hours.",
    });
    setForm({ full_name: "", email: "", phone: "", message: "", inquiry_type: "Tour Request", preferred_date: "" });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {propertyTitle && (
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
          Inquiring about: {propertyTitle}
        </p>
      )}
      <Input
        placeholder="Full Name"
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        required
        className="bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px]"
      />
      <Input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        className="bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px]"
      />
      <Input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px]"
      />
      <Select
        value={form.inquiry_type}
        onValueChange={(v) => setForm({ ...form, inquiry_type: v })}
      >
        <SelectTrigger className="bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Tour Request">Schedule a Tour</SelectItem>
          <SelectItem value="Virtual Tour">Virtual Tour</SelectItem>
          <SelectItem value="Price Inquiry">Price Inquiry</SelectItem>
          <SelectItem value="General">General Question</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={form.preferred_date}
        onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
        className="bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px]"
      />
      <Textarea
        placeholder="Your message..."
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={4}
        className="bg-transparent border-border/50 font-body text-sm resize-none rounded-[6px]"
      />
      <button
        type="submit"
        disabled={loading}
        className="ghost-btn w-full text-center disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}