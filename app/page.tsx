import EventCard from "@/components/EventCard"
import ExploreBtn from "@/components/ExploreBtn"
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const Page = async () => {
  "use cache"
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events }: { events: IEvent[] } = await response.json();
  return (
    <section>
      <h1 className="text-center">The hub for every dev <br/> Event you can't miss</h1>
      <p className="text-center mt-5"> Hackatons, meetups, conferences, All in one place</p>
      <ExploreBtn></ExploreBtn>
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {events && events.length > 0 && events.map((event) => (
            <li key={event.title}>
              <EventCard {...event}></EventCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Page