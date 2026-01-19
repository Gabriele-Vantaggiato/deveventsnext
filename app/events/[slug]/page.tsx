import { IEvent } from "@/database";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label }: { icon: string, alt: string, label: string }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17}></Image>
        <p>{label}</p>
    </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div key={tag} className="pill">{tag}</div>
        ))}
    </div>
)


const EventDetail = async ({ params }: { params: Promise<{ slug: string }> }) => {

    const { slug } = await params;
    const response = await fetch(`${BASE_URL}/api/events/${slug}`);
    const { event }: { event: IEvent } = await response.json();
    if (!event) return notFound();

    return (
        <section id="event">
            <div className="header">
                <h1> Event description </h1>
                <p className="mt-2"> {event.description}</p>
            </div>
            <div className="details">
                <div className="content">
                    <Image className="banner" src={event.image} alt="event banner" width={800} height={800} />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{event.overview}</p>
                    </section>
                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon='/icons/calendar.svg' alt='calendar' label={event.date}></EventDetailItem>
                        <EventDetailItem icon='/icons/clock.svg' alt='clock' label={event.time}></EventDetailItem>
                        <EventDetailItem icon='/icons/pin.svg' alt='pin' label={event.location}></EventDetailItem>
                        <EventDetailItem icon='/icons/mode.svg' alt='mode' label={event.mode}></EventDetailItem>
                        <EventDetailItem icon='/icons/audience.svg' alt='audience' label={event.audience}></EventDetailItem>
                    </section>
                    <EventAgenda agendaItems={JSON.parse(event.agenda[0])}></EventAgenda>
                    <section className="flex-col-gap-2">
                        <h2> About the organizer </h2>
                        <p> {event.organizer}</p>
                    </section>
                    <EventTags tags={JSON.parse(event.tags[0])}></EventTags>
                </div>
                <aside className="booking">
                    <p className="text-lg font-semibold">Book event</p>
                </aside>
            </div>
        </section>
    )
}

export default EventDetail