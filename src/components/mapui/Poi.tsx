import React from "react";
import {FaStar, FaStarHalfAlt, FaRegStar} from "react-icons/fa";
import { Area, AreaChart, XAxis, Tooltip, ResponsiveContainer } from "recharts";
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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 px-2 py-1 rounded text-white text-xs">
        {`${payload[0].value}%`}
      </div>
    );
  }
  return null;
};

export const Histogram: React.FC<{ hist: Record<string, Array<{ hour: number; occupancyPercent: number }>> }> = ({ hist }) => {
  const days = Object.keys(hist).filter(day => hist[day].some(d => d.occupancyPercent > 0));

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
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
                <Card className="p-2 bg-black text-white border-0">
                  <CardHeader className="p-2">
                    <CardTitle className="text-sm">{day}</CardTitle>
                    <CardDescription className="text-xs">Occupancy</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart 
                        data={dayData} 
                        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                      >
                        <XAxis 
                          dataKey="hour" 
                          tick={{ fontSize: 10 }} 
                          tickFormatter={(value) => value.split(':')[0]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="occupancyPercent" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="h-6 w-6 -left-3 bg-white/80 hover:bg-white absolute" />
      <CarouselNext className="h-6 w-6 -right-3 bg-white/80 hover:bg-white absolute" />
    </Carousel>
  );
};