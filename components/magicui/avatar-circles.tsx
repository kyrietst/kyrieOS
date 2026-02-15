"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AvatarCirclesProps {
    className?: string;
    numPeople?: number;
    avatarUrls: {
        imageUrl: string;
        profileUrl?: string;
        altText?: string;
        name?: string;
    }[];
}

export const AvatarCircles = ({
    numPeople,
    className,
    avatarUrls,
}: AvatarCirclesProps) => {
    return (
        <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
            {avatarUrls.map((url, index) => (
                <TooltipProvider key={index}>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:scale-105 transition-transform">
                                <AvatarImage src={url.imageUrl} alt={url.altText || "Avatar"} />
                                <AvatarFallback>{(url.name || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs font-medium">{url.name || "Membro"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
            {(numPeople ?? 0) > 0 && (
                <a
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:bg-white dark:text-black dark:hover:bg-gray-300"
                    href=""
                    onClick={(e) => e.preventDefault()}
                >
                    +{numPeople}
                </a>
            )}
        </div>
    );
};
