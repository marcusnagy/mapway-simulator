import React from "react";
import {FaStar, FaStarHalfAlt, FaRegStar} from "react-icons/fa";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {Array(fullStars).fill(null).map((_, i) => (
        <FaStar color="#FFD700" key={`full-${i}`} />
      ))}
      {halfStar && <FaStarHalfAlt color="#FFD700" key="half" />}
      {Array(emptyStars).fill(null).map((_, i) => (
        <FaRegStar color="#FFD700" key={`empty-${i}`} />
      ))}
    </div>
  );
};

export const Histogram: React.FC<{ hist: Record<string, Array<{ hour: number; occupancyPercent: number }>> }> = ({ hist }) => {
  const days = Object.keys(hist);

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full max-w-sm"
    >
      <CarouselContent>
        {days.map((day) => {
          const dayData = hist[day].map((d) => ({
            hour: `${d.hour}:00`,
            occupancyPercent: d.occupancyPercent,
          }));

          return (
            <CarouselItem key={day} className="basis-full">
              <div className="p-1">
              <Card className="p-4 bg-black text-white">
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                  <CardDescription>Occupancy percentage throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={dayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="occupancy percent" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};