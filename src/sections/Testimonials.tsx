import {
  CardTransformed,
  CardsContainer,
  ContainerScroll,
  ReviewStars,
} from "@/components/ui/animated-cards-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const TESTIMONIALS = [
  {
    id: "testimonial-1",
    name: "Sarah & James H.",
    profession: "Homeowners",
    rating: 5,
    description:
      "Kingsmere Property made buying our first home effortless. Their attention to detail and market knowledge gave us complete confidence from start to finish.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "testimonial-2",
    name: "Margaret T.",
    profession: "Property Investor",
    rating: 5,
    description:
      "A truly premium service. They handled everything with discretion, secured a fantastic tenant, and kept me informed at every step. Highly recommended.",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "testimonial-3",
    name: "Richard & Eleanor B.",
    profession: "Sellers",
    rating: 4.5,
    description:
      "From valuation to completion, the team was professional, responsive, and genuinely invested in achieving the best outcome for our family home.",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "testimonial-4",
    name: "David K.",
    profession: "Landlord",
    rating: 5,
    description:
      "The property management service is outstanding. My portfolio has never been in better hands — they treat every unit as if it were their own.",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  },
]

export function Testimonials() {
  return (
    <section className="bg-cream px-6 py-24 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="mb-3 block text-sm font-medium uppercase tracking-wider text-gold-600">
            Client Stories
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Testimonials
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600">
            Hear from the buyers, sellers, and landlords who trust Kingsmere
            Property with their most important assets.
          </p>
        </div>
      </div>
      <ContainerScroll className="h-[300vh]">
        <div className="sticky left-0 top-0 flex h-svh w-full items-center justify-center py-12">
          <CardsContainer className="mx-auto h-[420px] w-[340px]">
            {TESTIMONIALS.map((testimonial, index) => (
              <CardTransformed
                arrayLength={TESTIMONIALS.length}
                key={testimonial.id}
                variant="light"
                index={index + 2}
                role="article"
                aria-labelledby={`card-${testimonial.id}-title`}
                aria-describedby={`card-${testimonial.id}-content`}
              >
                <div className="flex flex-col items-center space-y-5 text-center">
                  <ReviewStars
                    className="text-gold-500"
                    rating={testimonial.rating}
                  />
                  <div className="mx-auto w-4/5 text-base leading-relaxed text-stone-800">
                    <blockquote cite="#">
                      &ldquo;{testimonial.description}&rdquo;
                    </blockquote>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="!size-12 border border-stone-200">
                    <AvatarImage
                      src={testimonial.avatarUrl}
                      alt={`Portrait of ${testimonial.name}`}
                    />
                    <AvatarFallback className="bg-stone-100 text-stone-800">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <span
                      id={`card-${testimonial.id}-title`}
                      className="block text-base font-semibold tracking-tight text-stone-900"
                    >
                      {testimonial.name}
                    </span>
                    <span
                      id={`card-${testimonial.id}-content`}
                      className="block text-sm text-stone-500"
                    >
                      {testimonial.profession}
                    </span>
                  </div>
                </div>
              </CardTransformed>
            ))}
          </CardsContainer>
        </div>
      </ContainerScroll>
    </section>
  )
}
