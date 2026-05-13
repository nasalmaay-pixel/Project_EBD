import { CheckCircle2, Quote, Star } from "lucide-react";
import { customerTestimonials } from "@/lib/data";

type CustomerTestimonialsProps = {
  className?: string;
};

export function CustomerTestimonials({ className = "" }: CustomerTestimonialsProps) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Customer stories</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-stone-950">
              Kesan dalam setiap cahaya.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-stone-600">
            Ulasan pembeli yang memakai lilin aromatherapy CandleX untuk kamar, ruang kerja, dan hadiah personal.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {customerTestimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-lg border border-white/70 bg-white/75 p-5 shadow-lg shadow-stone-900/5 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f9efe0] text-[#9b5b24]">
                  <Quote size={20} />
                </span>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                    <Star size={14} fill="currentColor" />
                    {testimonial.rating}
                  </span>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#4f6f52]">
                    <CheckCircle2 size={13} />
                    Verified buyer
                  </p>
                </div>
              </div>
              <p className="mt-5 leading-7 text-stone-700">&quot;{testimonial.comment}&quot;</p>
              <div className="mt-6 border-t border-stone-200 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-950">{testimonial.name}</p>
                    <p className="mt-1 text-sm text-stone-500">{testimonial.location}</p>
                  </div>
                  <p className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-[#9b5b24]">
                    {testimonial.purchasedAt}
                  </p>
                </div>
                <p className="mt-3 rounded-lg bg-[#f9efe0] px-3 py-2 text-sm font-semibold text-stone-800">
                  {testimonial.product}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
