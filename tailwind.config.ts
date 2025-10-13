
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
        accent: {
          "50": "#f0f9ff",
          "100": "#e0f2fe",
          "200": "#bae6fd",
          "300": "#7dd3fc",
          "400": "#38bdf8",
          "500": "#0ea5e9",
          "600": "#0284c7",
          "700": "#0369a1",
          "800": "#075985",
          "900": "#0c4a6e",
        },
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				
				// Healthcare specific colors
				healthcare: {
					"50": "#ebf9ff",
					"100": "#d0f1ff",
					"200": "#abe5ff",
					"300": "#71d4ff",
					"400": "#2fbcff",
					"500": "#07a3ff",
					"600": "#0084df",
					"700": "#0068b4",
					"800": "#005994",
					"900": "#084c79",
				},
				danger: {
					"50": "#fef2f2",
					"100": "#fee2e2",
					"200": "#fecaca",
					"300": "#fca5a5",
					"400": "#f87171",
					"500": "#ef4444",
					"600": "#dc2626",
					"700": "#b91c1c",
					"800": "#991b1b",
					"900": "#7f1d1d",
				},
				warning: {
					"50": "#fffbeb",
					"100": "#fef3c7",
					"200": "#fde68a",
					"300": "#fcd34d",
					"400": "#fbbf24",
					"500": "#f59e0b",
					"600": "#d97706",
					"700": "#b45309",
					"800": "#92400e",
					"900": "#78350f",
				},
				success: {
					"50": "#ecfdf5",
					"100": "#d1fae5",
					"200": "#a7f3d0",
					"300": "#6ee7b7",
					"400": "#34d399",
					"500": "#10b981",
					"600": "#059669",
					"700": "#047857",
					"800": "#065f46",
					"900": "#064e3b",
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			 backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))',
        'gradient-accent': 'linear-gradient(to right, hsl(var(--accent-gradient-start)), hsl(var(--accent-gradient-end)))',
      },
			keyframes: {
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'rotate-in': {
          '0%': { opacity: '0', transform: 'rotate(-3deg)' },
          '100%': { opacity: '1', transform: 'rotate(0deg)' },
        },
        'background-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'button-press': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
        'pulse-strong': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.7' },
        },
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'background-pan': 'background-pan 10s linear infinite alternate',
        'shimmer': 'shimmer 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'button-press': 'button-press 0.2s ease-out',
        'pulse-strong': 'pulse-strong 2s ease-in-out infinite',
        'slide-in-up': 'slide-in-up 0.6s ease-out both',
        'slide-in-right': 'slide-in-right 0.6s ease-out both',
        'zoom-in': 'zoom-in 0.4s ease-out both',
        'rotate-in': 'rotate-in 0.4s ease-out both',
			},
      video: {
        'background': 'url("/background-video.mp4")'
      }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
