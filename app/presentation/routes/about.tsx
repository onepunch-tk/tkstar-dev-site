import type { MetaFunction } from "react-router";
import AboutHeader from "../components/about/AboutHeader";
import AwardsCard from "../components/about/AwardsCard";
import CareerTimeline from "../components/about/CareerTimeline";
import EducationCard from "../components/about/EducationCard";
import StackCards from "../components/about/StackCards";

export const meta: MetaFunction = () => [{ title: "About — tkstar.dev" }];

export default function About() {
	return (
		<main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 sm:gap-14 sm:py-12">
			<AboutHeader />
			<StackCards />
			<CareerTimeline />
			<EducationCard />
			<AwardsCard />
		</main>
	);
}
