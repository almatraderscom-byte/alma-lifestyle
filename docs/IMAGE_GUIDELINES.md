# Image Upload Guidelines for ALMA Lifestyle

## Quick Reference

| Image Type | Dimensions | Aspect Ratio | Max Size |
|------------|------------|--------------|----------|
| Logo | 200×60 | 10:3 | 1MB |
| Favicon | 512×512 | 1:1 | 0.5MB |
| Hero Banner | 1920×1080 | 16:9 | 4MB |
| Product Main | 1200×1500 | 4:5 | 3MB |
| Product Gallery | 1200×1500 | 4:5 | 3MB |
| Category Card | 800×1000 | 4:5 | 2MB |
| Collection Banner | 1920×800 | 12:5 | 3MB |
| Family Main | 900×1100 | 9:11 | 3MB |
| Family Type Card | 600×600 | 1:1 | 1.5MB |
| Community Photo | 800×800 | 1:1 | 2MB |
| Brand Story Main | 800×1000 | 4:5 | 2MB |
| Brand Story Small | 600×600 | 1:1 | 2MB |
| OG / Social Share | 1200×630 | 1.91:1 | 2MB |

## Photo Quality Tips

- Use professional photography when possible
- Good lighting (natural daylight or softbox)
- Clean backgrounds (white or neutral)
- True colors (don't over-saturate)
- Sharp focus on main subject
- High resolution (don't use stretched small images)

## Implementation

Canonical specs live in `src/lib/image-specs.ts`. Admin uploads use `SmartImageUpload`, which shows recommendations and warns (without blocking) when dimensions differ.
