import {
  CardTransformed,
  CardsContainer,
  ContainerScroll,
  ReviewStars,
} from "@/components/ui/animated-cards-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSiteContent } from "@/hooks/useSiteContent"
import {
  DEFAULT_TESTIMONIALS_CONTENT,
  mergeContent,
} from "@/lib/site-content"

export function Testimonials() {
  const { data: content } = useSiteContent()
  const testimonials = mergeContent(DEFAULT_TESTIMONIALS_CONTENT, content?.testimonials)
  const items = testimonials.items

  return (
    <section className="bg-cream px-6 py-24 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="mb-3 block text-sm font-medium uppercase tracking-wider text-gold-600">
            {testimonials.eyebrow}
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            {testimonials.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600">
            {testimonials.subheading}
          </p>
        </div>
      </div>
      <ContainerScroll className="h-[300vh]">
        <div className="sticky left-0 top-0 flex h-svh w-full items-center justify-center py-12">
          <CardsContainer className="mx-auto h-[420px] w-[340px]">
            {items.map((testimonial, index) => (
              <CardTransformed
                arrayLength={items.length}
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
