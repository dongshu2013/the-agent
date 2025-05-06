'use client';

import Image from 'next/image';
import { getR2ImageUrl } from '@/lib/r2';
import { useEffect, useState } from 'react';
import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

interface GroupAvatarProps {
  photo?: string;
  name: string;
  size?: number;
  is_r2_url?: boolean;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export function GroupAvatar({
  photo,
  name,
  size = 32,
  is_r2_url = false
}: GroupAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string>(
    is_r2_url ? '' : photo || ''
  );

  // Generate a deterministic gradient background based on the name
  const getGradientBackground = () => {
    const gradients = [
      'linear-gradient(135deg, #FF9370 0%, #FFCC67 100%)', // Orange
      'linear-gradient(135deg, #72E5A5 0%, #8AE8B2 100%)', // Green
      'linear-gradient(135deg, #C683D7 0%, #C8A3E5 100%)', // Purple
      'linear-gradient(135deg, #5B8DEF 0%, #78A8FF 100%)', // Blue
      'linear-gradient(135deg, #FF7EB3 0%, #FF9EBF 100%)' // Pink
    ];

    // Use name to generate a consistent index for the same name
    const charSum = name
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = charSum % gradients.length;

    return gradients[index];
  };

  const initials = (() => {
    const firstChar = name.split(' ')[0][0];
    return /[a-zA-Z]/.test(firstChar) ? firstChar.toUpperCase() : firstChar;
  })();

  useEffect(() => {
    async function loadR2Url() {
      if (photo && is_r2_url) {
        const url = await getR2ImageUrl(photo);
        setImageUrl(url);
      }
    }
    loadR2Url();
  }, [photo, is_r2_url]);

  // Shared function to render initials with gradient background
  const renderInitialsAvatar = () => (
    <div
      className="flex items-center justify-center rounded-full text-white"
      style={{
        width: size,
        height: size,
        background: getGradientBackground()
      }}
    >
      <span
        className="font-bold"
        style={{ fontSize: `${Math.max(size * 0.4, 14)}px` }}
      >
        {initials}
      </span>
    </div>
  );

  if (photo) {
    return (
      <div
        className="relative rounded-full overflow-hidden"
        style={{ width: size, height: size }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          renderInitialsAvatar()
        )}
      </div>
    );
  }

  return renderInitialsAvatar();
}

export { Avatar, AvatarImage, AvatarFallback };
