# MentorScroll S3 Outputs

Videos uploaded to AWS S3 on **2026-07-18**.

## Bucket

| Field | Value |
|-------|-------|
| **Name** | `mentorscroll-outputs-899455913899-20260718` |
| **Region** | `us-east-1` |
| **Account** | `899455913899` |
| **Total objects** | 21 |
| **Total size** | ~138.3 MiB |

**Console:** https://s3.console.aws.amazon.com/s3/buckets/mentorscroll-outputs-899455913899-20260718

## Folder layout

| S3 prefix | Local source | Description |
|-----------|--------------|-------------|
| `test-outputs/` | `outputs/` | All test/render videos (mp4, webm) |
| `good-outputs/` | `demo-outputs/` | Curated demo videos |

## `good-outputs/` (2 files)

- `mentorscroll2d_newtons_laws_ranked_1784356365717.mp4`
- `mentorscroll2d_newtons_laws_ranked_with_sfx_bgm_loud_1784357968.mp4`

## `test-outputs/` (19 files)

- `mentorscroll2d_newtons_laws_1784353425499.mp4`
- `mentorscroll2d_newtons_laws_1784353425499.webm`
- `mentorscroll2d_newtons_laws_1784354462657.mp4`
- `mentorscroll2d_newtons_laws_1784354462657.webm`
- `mentorscroll2d_newtons_laws_ranked_1784356365717.mp4`
- `mentorscroll2d_newtons_laws_ranked_1784356365717.webm`
- `mentorscroll2d_newtons_laws_ranked_with_sfx_1784357319.mp4`
- `mentorscroll2d_newtons_laws_ranked_with_sfx_bgm_1784357896.mp4`
- `mentorscroll2d_newtons_laws_ranked_with_sfx_bgm_loud_1784357968.mp4`
- `mentorscroll2d_newtons_laws_ranked_with_vo_1784356365717.mp4`
- `mentorscroll2d_newtons_laws_with_vo_1784353791.mp4`
- `mentorscroll2d_newtons_laws_with_vo_1784353807.mp4`
- `mentorscroll2d_newtons_laws_with_vo_1784354462657.mp4`
- `mentorscroll_newtons_laws_1784349297525.mp4`
- `mentorscroll_newtons_laws_1784349297525.webm`
- `mentorscroll_newtons_laws_1784350526036.mp4`
- `mentorscroll_newtons_laws_1784350526036.webm`
- `mentorscroll_newtons_laws_1784352119000.mp4`
- `mentorscroll_newtons_laws_1784352119000.webm`

## CLI

```bash
# List folders
aws s3 ls s3://mentorscroll-outputs-899455913899-20260718/

# List test outputs
aws s3 ls s3://mentorscroll-outputs-899455913899-20260718/test-outputs/

# List good / demo outputs
aws s3 ls s3://mentorscroll-outputs-899455913899-20260718/good-outputs/

# Download a file
aws s3 cp s3://mentorscroll-outputs-899455913899-20260718/good-outputs/mentorscroll2d_newtons_laws_ranked_with_sfx_bgm_loud_1784357968.mp4 .

# Sync an entire folder locally
aws s3 sync s3://mentorscroll-outputs-899455913899-20260718/good-outputs/ ./good-outputs/
```
